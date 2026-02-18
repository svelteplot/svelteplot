import { describe, it, expect } from 'vitest';
import { normalizeX, normalizeY, normalizeParallelX, normalizeParallelY } from './normalize.js';
import type { DataRecord } from '../types/index.js';

const data = [
    { id: 'a1', group: 'A', x: 1, y: 2 },
    { id: 'a2', group: 'A', x: 3, y: 4 },
    { id: 'b1', group: 'B', x: 2, y: 6 },
    { id: 'b2', group: 'B', x: 4, y: 8 }
];

describe('normalizeY', () => {
    it('normalizes per group using sum as basis', () => {
        const { data: normalized, ...rest } = normalizeY<DataRecord>(
            {
                data,
                y: 'y',
                z: 'group'
            },
            'sum'
        );
        const channels = rest as Record<string, unknown>;

        const yChannel = channels['y'] as string;
        expect(yChannel).toBe('__y');
        expect(normalized).toHaveLength(data.length);

        const result = normalized.map((d) => ({
            id: d.id,
            group: d.group,
            y: d[yChannel]
        }));

        // For group A: y values are 2 and 4, sum = 6
        // For group B: y values are 6 and 8, sum = 14
        expect(result).toEqual([
            { id: 'a1', group: 'A', y: 2 / 6 },
            { id: 'a2', group: 'A', y: 4 / 6 },
            { id: 'b1', group: 'B', y: 6 / 14 },
            { id: 'b2', group: 'B', y: 8 / 14 }
        ]);
    });

    it('excepts options as object', () => {
        const { data: normalized, ...rest } = normalizeY<DataRecord>(
            {
                data,
                y: 'y',
                z: 'group'
            },
            { basis: 'sum' }
        );
        const channels = rest as Record<string, unknown>;

        const yChannel = channels['y'] as string;
        expect(yChannel).toBe('__y');
        expect(normalized).toHaveLength(data.length);

        const result = normalized.map((d) => ({
            id: d.id,
            group: d.group,
            y: d[yChannel]
        }));

        // For group A: y values are 2 and 4, sum = 6
        // For group B: y values are 6 and 8, sum = 14
        expect(result).toEqual([
            { id: 'a1', group: 'A', y: 2 / 6 },
            { id: 'a2', group: 'A', y: 4 / 6 },
            { id: 'b1', group: 'B', y: 6 / 14 },
            { id: 'b2', group: 'B', y: 8 / 14 }
        ]);
    });

    it('normalizes to [0, 1] range using extent as basis', () => {
        const { data: normalized, ...rest } = normalizeY<DataRecord>(
            {
                data,
                y: 'y',
                z: 'group'
            },
            'extent'
        );
        const channels = rest as Record<string, unknown>;

        const yChannel = channels['y'] as string;
        expect(yChannel).toBe('__y');

        const result = normalized.map((d) => ({
            id: d.id,
            group: d.group,
            y: d[yChannel]
        }));

        // For group A: y values 2, 4 -> (y - 2) / (4 - 2)
        // For group B: y values 6, 8 -> (y - 6) / (8 - 6)
        expect(result).toEqual([
            { id: 'a1', group: 'A', y: 0 },
            { id: 'a2', group: 'A', y: 1 },
            { id: 'b1', group: 'B', y: 0 },
            { id: 'b2', group: 'B', y: 1 }
        ]);
    });
});

describe('normalizeX', () => {
    it('normalizes using max as basis', () => {
        const { data: normalized, ...rest } = normalizeX<DataRecord>(
            {
                data,
                x: 'x'
            },
            'max'
        );
        const channels = rest as Record<string, unknown>;

        const xChannel = channels['x'] as string;
        expect(xChannel).toBe('__x');

        const result = normalized.map((d) => ({
            id: d.id,
            x: d[xChannel]
        }));

        // x values: 1, 3, 2, 4 -> max = 4
        expect(result).toEqual([
            { id: 'a1', x: 1 / 4 },
            { id: 'a2', x: 3 / 4 },
            { id: 'b1', x: 2 / 4 },
            { id: 'b2', x: 4 / 4 }
        ]);
    });
});

describe('normalizeParallelY', () => {
    it('normalizes independently for each categorical axis (x) and restores grouping by z', () => {
        const parallelData = [
            { Id: 'row1', Measurement: 'm1', Value: 1 },
            { Id: 'row2', Measurement: 'm1', Value: 3 },
            { Id: 'row1', Measurement: 'm2', Value: 2 },
            { Id: 'row2', Measurement: 'm2', Value: 6 }
        ];

        const { data: normalized, ...rest } = normalizeParallelY<DataRecord>(
            {
                data: parallelData,
                x: 'Measurement',
                y: 'Value',
                z: 'Id'
            },
            'extent'
        );
        const channels = rest as Record<string, unknown>;

        const yChannel = channels['y'] as string;
        expect(yChannel).toBe('__y');
        // grouping is restored by original z channel
        expect(channels['z']).toBe('Id');

        const result = normalized.map((d) => ({
            Id: d['Id'],
            Measurement: d['Measurement'],
            Value: d['Value'],
            y: d[yChannel]
        }));

        // For each Measurement (axis) independently:
        // m1: values 1, 3 -> (v - 1) / (3 - 1) = [0, 1]
        // m2: values 2, 6 -> (v - 2) / (6 - 2) = [0, 1]
        //
        // Data is sorted by Id (row1 first, then row2), so we expect:
        expect(result).toEqual([
            { Id: 'row1', Measurement: 'm1', Value: 1, y: 0 },
            { Id: 'row1', Measurement: 'm2', Value: 2, y: 0 },
            { Id: 'row2', Measurement: 'm1', Value: 3, y: 1 },
            { Id: 'row2', Measurement: 'm2', Value: 6, y: 1 }
        ]);
    });
});

describe('normalizeParallelX', () => {
    it('normalizes independently for each categorical axis (y) and restores grouping by z', () => {
        const parallelData = [
            { Id: 'row1', Measurement: 'm1', Value: 1 },
            { Id: 'row2', Measurement: 'm1', Value: 3 },
            { Id: 'row1', Measurement: 'm2', Value: 2 },
            { Id: 'row2', Measurement: 'm2', Value: 6 }
        ];

        const { data: normalized, ...rest } = normalizeParallelX<DataRecord>(
            {
                data: parallelData,
                x: 'Value',
                y: 'Measurement',
                z: 'Id'
            },
            'extent'
        );
        const channels = rest as Record<string, unknown>;

        const xChannel = channels['x'] as string;
        expect(xChannel).toBe('__x');
        // grouping is restored by original z channel
        expect(channels['z']).toBe('Id');

        const result = normalized.map((d) => ({
            Id: d['Id'],
            Measurement: d['Measurement'],
            Value: d['Value'],
            x: d[xChannel]
        }));

        // For each Measurement (axis) independently (now along x):
        // m1: values 1, 3 -> [0, 1]
        // m2: values 2, 6 -> [0, 1]
        //
        // Data is sorted by Id (row1 first, then row2), so we expect:
        expect(result).toEqual([
            { Id: 'row1', Measurement: 'm1', Value: 1, x: 0 },
            { Id: 'row1', Measurement: 'm2', Value: 2, x: 0 },
            { Id: 'row2', Measurement: 'm1', Value: 3, x: 1 },
            { Id: 'row2', Measurement: 'm2', Value: 6, x: 1 }
        ]);
    });
});
