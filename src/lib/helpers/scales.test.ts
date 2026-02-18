import { describe, it, expect } from 'vitest';
import { inferScaleType, looksLikeANumber } from './scales.js';

const STRINGS = ['foo', 'bar', 'baz'];
const DATES = [new Date(), new Date()];
const NUMBERS = [1, 2, 3, 4];

describe('inferScaleType', () => {
    it('infers point for strings', () => {
        expect(inferScaleType('x', STRINGS, new Set())).toBe('point');
    });
    it('infers linear for numbers', () => {
        expect(inferScaleType('x', NUMBERS, new Set())).toBe('linear');
    });
    it('infers sqrt for radius axis', () => {
        expect(inferScaleType('r', NUMBERS, new Set())).toBe('sqrt');
    });
    it('correctly infers time scale', () => {
        expect(inferScaleType('x', DATES, new Set())).toBe('time');
    });
    it('enforces ordinal scale for symbol axis', () => {
        expect(inferScaleType('symbol', STRINGS, new Set())).toBe('ordinal');
        expect(inferScaleType('symbol', DATES, new Set())).toBe('ordinal');
        expect(inferScaleType('symbol', NUMBERS, new Set())).toBe('ordinal');
    });
    it('enforces band scales for bars and ticks', () => {
        expect(inferScaleType('x', NUMBERS, new Set(['barY']))).toBe('band');
        expect(inferScaleType('x', STRINGS, new Set(['barY']))).toBe('band');
        expect(inferScaleType('x', NUMBERS, new Set(['tickY']))).toBe('band');
        expect(inferScaleType('x', STRINGS, new Set(['cell']))).toBe('band');
        expect(inferScaleType('y', NUMBERS, new Set(['barX']))).toBe('band');
        expect(inferScaleType('y', NUMBERS, new Set(['tickX']))).toBe('band');
        expect(inferScaleType('y', STRINGS, new Set(['tickX']))).toBe('band');
    });
    it('infers point scale if just one value', () => {
        expect(inferScaleType('x', [1], new Set())).toBe('point');
        expect(inferScaleType('x', ['x'], new Set())).toBe('point');
        expect(inferScaleType('x', [new Date()], new Set())).toBe('point');
    });
    it('infers linear scale from scale options is set', () => {
        expect(inferScaleType('x', [0, 10], new Set(['tickY']))).toBe('band');
        expect(inferScaleType('x', [0, 10], new Set(['tickY']), { domain: [0, 100] })).toBe(
            'linear'
        );
        expect(inferScaleType('x', [0, 10], new Set(['tickY']), { nice: true })).toBe('linear');
        expect(inferScaleType('x', [0, 10], new Set(['tickY']), { zero: true })).toBe('linear');
    });
});

describe('looksLikeANumber', () => {
    it('returns true for valid numbers', () => {
        expect(looksLikeANumber(123)).toBe(true);
        expect(looksLikeANumber(-456)).toBe(true);
        expect(looksLikeANumber(0)).toBe(true);
        expect(looksLikeANumber(3.14)).toBe(true);
    });

    it('returns true for valid number strings', () => {
        expect(looksLikeANumber('123')).toBe(true);
        expect(looksLikeANumber('-456')).toBe(true);
        expect(looksLikeANumber('0')).toBe(true);
        expect(looksLikeANumber('3.14')).toBe(true);
    });

    it('returns false for invalid inputs', () => {
        expect(looksLikeANumber('abc')).toBe(false);
        expect(looksLikeANumber('')).toBe(false);
        expect(looksLikeANumber('   ')).toBe(false);
        expect(looksLikeANumber(null as any)).toBe(false);
        expect(looksLikeANumber(undefined as any)).toBe(false);
        expect(looksLikeANumber(NaN)).toBe(false);
        expect(looksLikeANumber(true as any)).toBe(false);
        expect(looksLikeANumber(false as any)).toBe(false);
        expect(looksLikeANumber([] as any)).toBe(false);
        expect(looksLikeANumber({} as any)).toBe(false);
    });
});
