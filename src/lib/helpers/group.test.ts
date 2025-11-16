import { groupFacetsAndZ } from './group.js';
import { describe, it, expect } from 'vitest';

describe('groupFacetsAndZ', () => {
    it('should group items by facets and z', () => {
        const items = [
            { facet: 'A', z: 1, color: 'red', value: 10 },
            { facet: 'A', z: 1, color: 'red', value: 15 },
            { facet: 'A', z: 2, color: 'red', value: 20 },
            { facet: 'B', z: 1, color: 'red', value: 30 },
            { facet: 'B', z: 2, color: 'blue', value: 40 }
        ];

        const channels = {
            fx: 'facet',
            fill: 'color',
            z: 'z'
        };

        const result: number[] = [];

        const newChannels = groupFacetsAndZ(items, channels, (groupedItems) => {
            result.push(groupedItems.length);
        });

        expect(newChannels).toEqual({ fx: 'facet', z: 'z' });
        expect(result).toEqual([2, 1, 1, 1]);
    });

    it('implicitly groups by fill and stroke if z is not present', () => {
        const items = [
            { color: 'red', value: 10 },
            { color: 'red', value: 15 },
            { color: 'blue', value: 20 },
            { color: 'red', value: 30 },
            { color: 'blue', value: 40 }
        ];

        const channels = {
            fill: 'color'
        };

        const result: number[] = [];

        const newChannels = groupFacetsAndZ(items, channels, (groupedItems) => {
            result.push(groupedItems.length);
        });

        expect(newChannels).toEqual({ fill: 'color' });
        expect(result).toEqual([3, 2]);
    });
    // Add more test cases if needed
});
