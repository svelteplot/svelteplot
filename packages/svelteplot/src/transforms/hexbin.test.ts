import { describe, it, expect } from 'vitest';
import { hexbin } from './hexbin.js';

describe('hexbin', () => {
    const data = [
        { x: 1, y: 1 },
        { x: 1.1, y: 1.05 },
        { x: 1.05, y: 0.95 },
        { x: 5, y: 5 },
        { x: 5.1, y: 5.1 },
        { x: 10, y: 10 }
    ];

    it('bins data into hexagonal cells', () => {
        const result = hexbin({ data, x: 'x', y: 'y' }, { bins: 5, fill: 'count' });

        // Nearby points should be binned together
        expect(result.data.length).toBeLessThan(data.length);
        expect(result.data.length).toBeGreaterThan(0);
    });

    it('applies count reducer', () => {
        const result = hexbin({ data, x: 'x', y: 'y' }, { bins: 5, fill: 'count' });

        // Each bin should have a fill value (count)
        const fillChannel = result.fill;
        expect(fillChannel).toBeDefined();

        // Check that counts sum to total data points
        const totalCount = result.data.reduce((sum, d) => {
            return sum + (d[fillChannel as string | symbol] as number);
        }, 0);
        expect(totalCount).toBe(data.length);
    });

    it('applies count reducer to r channel', () => {
        const result = hexbin({ data, x: 'x', y: 'y' }, { bins: 5, r: 'count' });

        expect(result.r).toBeDefined();
        result.data.forEach((d) => {
            const rVal = d[result.r as string | symbol] as number;
            expect(typeof rVal).toBe('number');
            expect(rVal).toBeGreaterThan(0);
        });
    });

    it('returns empty data for empty input', () => {
        const result = hexbin({ data: [], x: 'x', y: 'y' }, { bins: 5 });
        expect(result.data).toHaveLength(0);
    });

    it('throws without x or y channel', () => {
        expect(() => hexbin({ data, x: 'x' } as any, {})).toThrow('hexbin requires both x and y');
        expect(() => hexbin({ data, y: 'y' } as any, {})).toThrow('hexbin requires both x and y');
    });

    it('preserves bin center coordinates in data space', () => {
        const result = hexbin({ data, x: 'x', y: 'y' }, { bins: 5 });

        const xChannel = result.x as string;
        const yChannel = result.y as string;

        result.data.forEach((d) => {
            const cx = d[xChannel] as number;
            const cy = d[yChannel] as number;
            // Bin centers should be within the data range (with some padding)
            expect(cx).toBeGreaterThanOrEqual(0);
            expect(cx).toBeLessThanOrEqual(12);
            expect(cy).toBeGreaterThanOrEqual(-1);
            expect(cy).toBeLessThanOrEqual(12);
        });
    });

    it('nearby points land in the same bin', () => {
        const closeData = [
            { x: 5, y: 5 },
            { x: 5.01, y: 5.01 },
            { x: 5.02, y: 4.99 }
        ];
        // Use explicit binWidth large enough to contain all 3 points
        const result = hexbin({ data: closeData, x: 'x', y: 'y' }, { binWidth: 1, fill: 'count' });

        // All 3 points should be in a single bin
        expect(result.data).toHaveLength(1);
        const fillChannel = result.fill as string | symbol;
        expect(result.data[0][fillChannel]).toBe(3);
    });

    it('supports explicit binWidth', () => {
        const result = hexbin({ data, x: 'x', y: 'y' }, { binWidth: 2, fill: 'count' });
        expect(result.data.length).toBeGreaterThan(0);
    });
});
