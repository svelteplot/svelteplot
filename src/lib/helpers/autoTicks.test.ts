import { describe, it, expect } from 'vitest';
import { maybeInterval, autoTicks, type IntervalLike } from './autoTicks.js';

describe('maybeInterval', () => {
    it('returns undefined for null', () => {
        expect(maybeInterval(null)).toBeUndefined();
    });

    it('returns undefined for undefined', () => {
        expect(maybeInterval(undefined as unknown as null)).toBeUndefined();
    });

    it('creates integer interval with correct floor/offset/range', () => {
        const iv = maybeInterval(5)! as IntervalLike;
        expect(iv.floor(12)).toBe(10);
        expect(iv.floor(15)).toBe(15);
        expect(iv.offset(10)).toBe(15);
        expect(iv.range(0, 20)).toEqual([0, 5, 10, 15]);
    });

    it('creates fractional interval (e.g. 0.25) with correct floor/offset/range', () => {
        const iv = maybeInterval(0.25)! as IntervalLike;
        // 0.25 → triggers 1/interval branch (negative), n = 4
        expect(iv.floor(0.3)).toBe(0.25);
        expect(iv.floor(0.5)).toBe(0.5);
        expect(iv.offset(0.5)).toBe(0.75);
        const r = iv.range(0, 1);
        expect(r).toEqual([0, 0.25, 0.5, 0.75]);
    });

    it('creates round method for numeric intervals', () => {
        const iv = maybeInterval(5)! as IntervalLike;
        expect(iv.round!(12)).toBe(10);
        expect(iv.round!(13)).toBe(15);
    });

    it('passes through valid custom interval object', () => {
        const custom = {
            floor: (d: number) => Math.floor(d),
            offset: (d: number) => d + 1,
            range: (lo: number, hi: number) => {
                const out = [];
                for (let i = lo; i < hi; i++) out.push(i);
                return out;
            }
        };
        expect(maybeInterval(custom)).toBe(custom);
    });

    it('throws for object missing floor method', () => {
        const bad = { offset: () => 0, range: () => [] } as any;
        expect(() => maybeInterval(bad)).toThrow('missing floor method');
    });

    it('throws for object missing offset method', () => {
        const bad = { floor: () => 0, range: () => [] } as any;
        expect(() => maybeInterval(bad)).toThrow('missing offset method');
    });
});

describe('autoTicks', () => {
    it('returns ticks as-is when provided (truthy array)', () => {
        const ticks = [1, 2, 3];
        expect(autoTicks('linear', ticks, null, [], {}, 10)).toBe(ticks);
    });

    it('returns empty array as-is when provided (empty array is truthy)', () => {
        const ticks: number[] = [];
        expect(autoTicks('linear', ticks, 5, [0, 20], {}, 10)).toBe(ticks);
    });

    it('generates ticks from numeric interval', () => {
        const result = autoTicks('linear', null as any, 5, [0, 20], {}, 10);
        expect(result).toEqual([0, 5, 10, 15, 20]);
    });

    it('returns empty array when domain has null extent', () => {
        const result = autoTicks('linear', null as any, 5, [], {}, 10);
        expect(result).toEqual([]);
    });

    it('falls back to scaleFn.ticks when no interval', () => {
        const scaleFn = { ticks: (count: number) => [0, 50, 100] };
        const result = autoTicks('linear', null as any, null, [0, 100], scaleFn, 3);
        expect(result).toEqual([0, 50, 100]);
    });

    it('returns empty array when scaleFn has no ticks method', () => {
        const result = autoTicks('linear', null as any, null, [0, 100], {}, 10);
        expect(result).toEqual([]);
    });

    it('filters ticks to domain bounds with numeric interval', () => {
        // interval=5, domain=[3, 17] → range produces [5, 10, 15, 20] but
        // filter keeps only [5, 10, 15] (those >= 3 and <= 17)
        const result = autoTicks('linear', null as any, 5, [3, 17], {}, 10);
        expect(result).toEqual([5, 10, 15]);
    });

    it('handles fractional interval in autoTicks', () => {
        const result = autoTicks('linear', null as any, 0.25, [0, 1], {}, 10);
        expect(result).toEqual([0, 0.25, 0.5, 0.75, 1]);
    });
});
