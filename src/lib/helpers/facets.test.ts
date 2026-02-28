import { describe, it, expect } from 'vitest';
import { getEmptyFacets } from './facets.js';
import type { GenericMarkOptions, Mark } from '../types/index.js';

/**
 * Creates a minimal mock mark for testing getEmptyFacets.
 * Only populates the fields that getEmptyFacets actually accesses:
 * - options.__firstFacet, options.automatic, options.fx, options.fy
 * - data (array of plain objects with fx/fy keys)
 */
function mockMark(
    opts: {
        data?: Record<string, unknown>[];
        fx?: string;
        fy?: string;
        __firstFacet?: boolean;
        automatic?: boolean;
    } = {}
): Mark<GenericMarkOptions> {
    const { data = [], fx, fy, __firstFacet = true, automatic = false } = opts;
    return {
        id: Symbol('test-mark'),
        type: 'dot',
        channels: [],
        scales: new Set(),
        data,
        options: { __firstFacet, automatic, fx, fy }
    } as unknown as Mark<GenericMarkOptions>;
}

describe('getEmptyFacets', () => {
    it('returns all false (non-empty) when no marks are provided', () => {
        const result = getEmptyFacets([], ['A', 'B'], ['X', 'Y']);
        // With no marks, no facetted marks exist, so hasFacettedData starts
        // as false for 2D facets — meaning all combinations are "empty"
        for (const [, fyMap] of result) {
            for (const [, isEmpty] of fyMap) {
                expect(isEmpty).toBe(true);
            }
        }
    });

    it('marks all facets non-empty for single fx dimension with full coverage', () => {
        const mark = mockMark({
            fx: 'fx',
            data: [{ fx: 'A' }, { fx: 'B' }]
        });
        // When fyValues has exactly 1 entry, hasFacettedData starts as true
        const result = getEmptyFacets([mark], ['A', 'B'], [true]);
        expect(result.get('A')?.get(true)).toBe(false);
        expect(result.get('B')?.get(true)).toBe(false);
    });

    it('detects empty facets when fx+fy combination has no data', () => {
        const mark = mockMark({
            fx: 'fx',
            fy: 'fy',
            data: [
                { fx: 'A', fy: 'X' },
                { fx: 'B', fy: 'Y' }
            ]
        });
        const result = getEmptyFacets([mark], ['A', 'B'], ['X', 'Y']);
        // A-X and B-Y have data
        expect(result.get('A')?.get('X')).toBe(false);
        expect(result.get('B')?.get('Y')).toBe(false);
        // A-Y and B-X have no data → empty
        expect(result.get('A')?.get('Y')).toBe(true);
        expect(result.get('B')?.get('X')).toBe(true);
    });

    it('filters out automatic marks', () => {
        const mark = mockMark({
            fx: 'fx',
            fy: 'fy',
            automatic: true,
            data: [{ fx: 'A', fy: 'X' }]
        });
        const result = getEmptyFacets([mark], ['A', 'B'], ['X', 'Y']);
        // Automatic mark is excluded → all 2D combos are empty
        for (const [, fyMap] of result) {
            for (const [, isEmpty] of fyMap) {
                expect(isEmpty).toBe(true);
            }
        }
    });

    it('filters out marks with empty data', () => {
        const mark = mockMark({
            fx: 'fx',
            fy: 'fy',
            data: []
        });
        const result = getEmptyFacets([mark], ['A'], ['X']);
        // Mark has empty data → filtered out, but single-dimension so non-empty
        expect(result.get('A')?.get('X')).toBe(false);
    });

    it('filters out marks without fx channel when fxValues has multiple entries', () => {
        // Mark has no fx accessor but there are multiple fx facets
        const mark = mockMark({
            fy: 'fy',
            data: [{ fy: 'X' }]
        });
        const result = getEmptyFacets([mark], ['A', 'B'], ['X']);
        // Mark is filtered out (fx is null, fxValues.length > 1)
        // But since fyValues has 1 entry, hasFacettedData starts as true
        expect(result.get('A')?.get('X')).toBe(false);
        expect(result.get('B')?.get('X')).toBe(false);
    });

    it('filters out marks without fy channel when fyValues has multiple entries', () => {
        const mark = mockMark({
            fx: 'fx',
            data: [{ fx: 'A' }]
        });
        const result = getEmptyFacets([mark], ['A'], ['X', 'Y']);
        // Mark has no fy accessor, fyValues.length > 1 → filtered out
        // fxValues has 1 entry, so hasFacettedData starts as true
        expect(result.get('A')?.get('X')).toBe(false);
        expect(result.get('A')?.get('Y')).toBe(false);
    });

    it('returns correct structure: outer map keyed by fx, inner by fy', () => {
        const result = getEmptyFacets([], ['A', 'B'], ['X', 'Y']);
        expect(result.size).toBe(2);
        expect(result.get('A')?.size).toBe(2);
        expect(result.get('B')?.size).toBe(2);
        expect(result.has('A')).toBe(true);
        expect(result.has('B')).toBe(true);
        expect(result.get('A')?.has('X')).toBe(true);
        expect(result.get('A')?.has('Y')).toBe(true);
    });

    it('handles marks without __firstFacet flag', () => {
        const mark = mockMark({
            fx: 'fx',
            fy: 'fy',
            __firstFacet: false,
            data: [{ fx: 'A', fy: 'X' }]
        });
        const result = getEmptyFacets([mark], ['A', 'B'], ['X', 'Y']);
        // Mark is excluded because __firstFacet is false
        for (const [, fyMap] of result) {
            for (const [, isEmpty] of fyMap) {
                expect(isEmpty).toBe(true);
            }
        }
    });

    it('handles full coverage across all fx+fy combinations', () => {
        const mark = mockMark({
            fx: 'fx',
            fy: 'fy',
            data: [
                { fx: 'A', fy: 'X' },
                { fx: 'A', fy: 'Y' },
                { fx: 'B', fy: 'X' },
                { fx: 'B', fy: 'Y' }
            ]
        });
        const result = getEmptyFacets([mark], ['A', 'B'], ['X', 'Y']);
        // All combinations have data → none empty
        expect(result.get('A')?.get('X')).toBe(false);
        expect(result.get('A')?.get('Y')).toBe(false);
        expect(result.get('B')?.get('X')).toBe(false);
        expect(result.get('B')?.get('Y')).toBe(false);
    });

    it('considers multiple marks for coverage', () => {
        const mark1 = mockMark({
            fx: 'fx',
            fy: 'fy',
            data: [{ fx: 'A', fy: 'X' }]
        });
        const mark2 = mockMark({
            fx: 'fx',
            fy: 'fy',
            data: [{ fx: 'B', fy: 'Y' }]
        });
        const result = getEmptyFacets([mark1, mark2], ['A', 'B'], ['X', 'Y']);
        // Both marks contribute to facetted data
        expect(result.get('A')?.get('X')).toBe(false);
        expect(result.get('B')?.get('Y')).toBe(false);
        // Gaps still detected
        expect(result.get('A')?.get('Y')).toBe(true);
        expect(result.get('B')?.get('X')).toBe(true);
    });

    it('handles null fx values in domain', () => {
        const mark = mockMark({
            fx: 'fx',
            data: [{ fx: 'A' }, { fx: 'B' }, { fx: null }]
        });
        const result = getEmptyFacets([mark], ['A', 'B', null], [true]);
        // All three facet values (including null) should have data
        expect(result.get('A')?.get(true)).toBe(false);
        expect(result.get('B')?.get(true)).toBe(false);
        expect(result.get(null)?.get(true)).toBe(false);
    });

    it('handles null fy values in domain', () => {
        const mark = mockMark({
            fx: 'fx',
            fy: 'fy',
            data: [
                { fx: 'A', fy: 'X' },
                { fx: 'A', fy: null }
            ]
        });
        const result = getEmptyFacets([mark], ['A'], ['X', null]);
        expect(result.get('A')?.get('X')).toBe(false);
        expect(result.get('A')?.get(null)).toBe(false);
    });
});
