import { describe, it, expect } from 'vitest';
import { sort, shuffle } from './sort.js';
import type { DataRecord } from '$lib/types.js';

const data: DataRecord[] = [
    { A: 1, B: 7 },
    { A: 5, B: 4 },
    { A: 3, B: 3 }
];

const sortedByA = data.sort((a, b) => a.A - b.A);

describe('sort transform', () => {
    it('does not sort if no sort channel is defined', () => {
        expect(sort({ data }).data).toStrictEqual(data);
    });

    it('sort data by string accessor', () => {
        expect(sort({ data, sort: 'A' }).data).toStrictEqual(sortedByA);
    });

    it('sort data by accessor function', () => {
        expect(sort({ data, sort: (d) => d.A }).data).toStrictEqual(sortedByA);
    });

    it('sort data by comperator function', () => {
        expect(sort({ data, sort: (a, b) => a.A - b.A }).data).toStrictEqual(sortedByA);
    });

    it('sort data by channel', () => {
        expect(sort({ data, x: 'A', sort: { channel: 'x' } }).data).toStrictEqual(sortedByA);
    });

    it('sort data by channel descending', () => {
        expect(
            sort({ data, x: 'A', sort: { channel: 'x', order: 'descending' } }).data
        ).toStrictEqual(sortedByA.toReversed());
    });

    it('sort data by channel descending alternative syntax', () => {
        expect(sort({ data, y: 'A', sort: { channel: '-y' } }).data).toStrictEqual(
            sortedByA.toReversed()
        );
    });
});

describe('shuffle transform', () => {
    it('shuffles the data', () => {
        const shuffled = shuffle({ data }, { seed: 1 });
        expect(shuffled.sort).toBe(null);
        expect(shuffled.data).toHaveLength(data.length);
        expect(shuffled.data).not.toStrictEqual(data);
        expect(shuffled.data.sort((a, b) => a.A - b.A)).toStrictEqual(sortedByA);
    });
});
