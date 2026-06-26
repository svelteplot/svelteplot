import { describe, it, expect } from 'vitest';
import { scalePoint } from 'd3-scale';
import { createScale, inferScaleType, looksLikeANumber } from './scales.js';
import { IS_SORTED } from '../transforms/sort.js';
import type { Mark } from '../types/mark.js';
import type { GenericMarkOptions } from '../types/index.js';

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
    it('infers time scale when nice is set on date data', () => {
        expect(inferScaleType('x', DATES, new Set(['tickY']), { nice: true })).toBe('time');
    });
});

const plotDefaults = {} as any;
const basePlotOptions = {
    implicitScales: true,
    sortOrdinalDomains: true
} as any;

function mockMark(
    data: Record<string, unknown>[],
    options: GenericMarkOptions & { [IS_SORTED]?: unknown }
): Mark<GenericMarkOptions> {
    return {
        id: Symbol(),
        type: 'dot',
        channels: ['x', 'y'],
        scales: new Set(['x', 'y']),
        data,
        options
    };
}

describe('createScale sorted ordinal domain', () => {
    it('uses the first sorted mark bound to the scale for domain order', () => {
        const unsorted = mockMark(
            [
                { label: 'Zulu', value: 300 },
                { label: 'Alpha', value: 100 },
                { label: 'Beta', value: 200 }
            ],
            { x: 'value', y: 'label' }
        );
        const sorted = mockMark(
            [
                { label: 'Zulu', value: 300 },
                { label: 'Beta', value: 200 },
                { label: 'Alpha', value: 100 }
            ],
            { x: 'value', y: 'label', [IS_SORTED]: { channel: '-x' } }
        );

        const scale = createScale(
            'y',
            {
                scale: ({ domain, plotHeight }: any) =>
                    scalePoint()
                        .domain(domain)
                        .range([plotHeight, 0])
            },
            [unsorted, sorted],
            basePlotOptions,
            100,
            100,
            false,
            plotDefaults
        );

        // y domains are reversed from value order
        expect(scale.domain).toEqual(['Alpha', 'Beta', 'Zulu']);
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
        expect(looksLikeANumber(null as unknown as string)).toBe(false);
        expect(looksLikeANumber(undefined as unknown as string)).toBe(false);
        expect(looksLikeANumber(NaN)).toBe(false);
        expect(looksLikeANumber(true as unknown as string)).toBe(false);
        expect(looksLikeANumber(false as unknown as string)).toBe(false);
        expect(looksLikeANumber([] as unknown as string)).toBe(false);
        expect(looksLikeANumber({} as unknown as string)).toBe(false);
    });
});
