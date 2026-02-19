import { describe, it, expect } from 'vitest';
import mergeDeep from './mergeDeep.js';

describe('mergeDeep', () => {
    it('shallow merges two flat objects', () => {
        const result = mergeDeep({ a: 1 }, { b: 2 });
        expect(result).toEqual({ a: 1, b: 2 });
    });

    it('deep merges nested objects recursively', () => {
        const result = mergeDeep({ a: { x: 1, y: 2 } }, { a: { y: 3, z: 4 } });
        expect(result).toEqual({ a: { x: 1, y: 3, z: 4 } });
    });

    it('applies multiple sources left to right', () => {
        const result = mergeDeep({ a: 1 }, { a: 2, b: 10 }, { a: 3 });
        expect(result).toEqual({ a: 3, b: 10 });
    });

    it('overwrites arrays (does not merge them)', () => {
        const result = mergeDeep({ a: [1, 2] }, { a: [3, 4, 5] });
        expect(result).toEqual({ a: [3, 4, 5] });
    });

    it('preserves target value when source value is null', () => {
        const result = mergeDeep({ a: 1, b: 2 }, { a: null, b: 3 });
        expect(result).toEqual({ a: 1, b: 3 });
    });

    it('includes non-overlapping keys from both target and sources', () => {
        const result = mergeDeep({ a: 1 }, { b: 2 }, { c: 3 });
        expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('does not mutate source objects', () => {
        const source = { a: { x: 1 } };
        const sourceCopy = JSON.parse(JSON.stringify(source));
        mergeDeep({ a: { y: 2 } }, source);
        expect(source).toEqual(sourceCopy);
    });

    it('handles falsy target value 0 correctly', () => {
        // When target[key] is 0 (falsy), deep merge should still
        // recognize it as an existing non-object value and overwrite
        // with the source value, not create an empty object
        const result = mergeDeep({ a: 0 }, { a: 5 });
        expect(result).toEqual({ a: 5 });
    });

    it('handles falsy target value empty string correctly', () => {
        const result = mergeDeep({ a: '' }, { a: 'hello' });
        expect(result).toEqual({ a: 'hello' });
    });

    it('handles falsy target value false correctly', () => {
        const result = mergeDeep({ a: false }, { a: true });
        expect(result).toEqual({ a: true });
    });

    it('does not overwrite target value with nested source when target is non-object', () => {
        // If target has a primitive and source has an object for the same key,
        // the source object should win
        const result = mergeDeep({ a: 42 }, { a: { nested: true } });
        expect(result).toEqual({ a: { nested: true } });
    });

    it('returns target as-is when no sources provided', () => {
        const target = { a: 1 };
        const result = mergeDeep(target);
        expect(result).toEqual({ a: 1 });
        expect(result).toBe(target);
    });

    it('handles deeply nested objects (3+ levels)', () => {
        const result = mergeDeep({ a: { b: { c: 1, d: 2 } } }, { a: { b: { c: 10, e: 3 } } });
        expect(result).toEqual({ a: { b: { c: 10, d: 2, e: 3 } } });
    });

    it('does not mutate the sources array', () => {
        const sources = [{ b: 2 }, { c: 3 }];
        const sourcesCopy = [...sources];
        mergeDeep({ a: 1 }, ...sources);
        expect(sources.length).toBe(sourcesCopy.length);
    });
});
