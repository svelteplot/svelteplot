import { describe, it, expect } from 'vitest';
import { recordizeXY, indexData, RAW_VALUE, X, Y } from './recordize.js';
import type { RawValue } from '$lib/types/index.js';
import { INDEX } from '$lib/constants.js';

const coordsArray: [RawValue, RawValue][] = [
    [0, 4],
    [1, 3],
    [2, 2],
    [3, 1]
];

describe('recordizeXY', () => {
    it('converts arrays of numbers into records', () => {
        const { data, ...channels } = recordizeXY({ data: coordsArray });
        expect(data[0]).toStrictEqual({ [RAW_VALUE]: [0, 4], [X]: 0, [Y]: 4, [INDEX]: 0 });
        expect(data[1]).toStrictEqual({ [RAW_VALUE]: [1, 3], [X]: 1, [Y]: 3, [INDEX]: 1 });
        expect(channels).toStrictEqual({ x: X, y: Y });
    });

    it("doesn't converts if x channel accessor is set", () => {
        const { data, ...channels } = recordizeXY({ data: coordsArray, x: 0 });
        expect(data[0]).toStrictEqual([0, 4]);
        expect(data[1]).toStrictEqual([1, 3]);
        expect(channels).toStrictEqual({ x: 0 });
    });
});

describe('indexData', () => {
    it('adds index to each data record', () => {
        const input = [{ a: 1 }, { a: 2 }, { a: 3 }];
        const indexed = indexData(input);
        expect(indexed[0][INDEX]).toBe(0);
        expect(indexed[1][INDEX]).toBe(1);
        expect(indexed[2][INDEX]).toBe(2);
    });
});
