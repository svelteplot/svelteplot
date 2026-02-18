import { describe, it, expect } from 'vitest';
import { binX, bin, type BinXOptions } from './bin.js';
import { range } from 'd3-array';
import { ORIGINAL_NAME_KEYS } from 'svelteplot/constants.js';

describe('binX', () => {
    const input = {
        data: [
            { x: 1, y: 10 },
            { x: 2, y: 20 },
            { x: 3, y: 30 },
            { x: 4, y: 40 },
            { x: 5, y: 50 }
        ],
        x: 'x'
    };

    it('bins the x channel with default options', () => {
        const options: BinXOptions = {
            thresholds: 'auto',
            y: 'count',
            cumulative: false
        };

        const { data, ...channels } = binX(input, options);

        const expectedData = [
            {
                [channels.x1 as string]: 0,
                [channels.x as string]: 1,
                [channels.x2 as string]: 2,
                [channels.y as string]: 1
            },
            {
                [channels.x1 as string]: 2,
                [channels.x as string]: 3,
                [channels.x2 as string]: 4,
                [channels.y as string]: 2
            },
            {
                [channels.x1 as string]: 4,
                [channels.x as string]: 5,
                [channels.x2 as string]: 6,
                [channels.y as string]: 2
            }
        ];
        const expectedChannels = {
            [ORIGINAL_NAME_KEYS.x]: 'x',
            [ORIGINAL_NAME_KEYS.y]: 'Frequency',

            insetLeft: 0.5,
            insetRight: 0.5
        };

        expect(data).toStrictEqual(expectedData);
        expect(channels).toStrictEqual(expect.objectContaining(expectedChannels));
    });

    it('bins the x channel with custom options', () => {
        const options: BinXOptions = {
            thresholds: 'auto',
            y: 'count',
            cumulative: 1
        };

        const { data, ...channels } = binX(input, options);

        const expectedOutputData = [
            {
                [channels.x1 as string]: 0,
                [channels.x as string]: 1,
                [channels.x2 as string]: 2,
                [channels.y as string]: 1
            },
            {
                [channels.x1 as string]: 2,
                [channels.x as string]: 3,
                [channels.x2 as string]: 4,
                [channels.y as string]: 3
            },
            {
                [channels.x1 as string]: 4,
                [channels.x as string]: 5,
                [channels.x2 as string]: 6,
                [channels.y as string]: 5
            }
        ];

        const expectedChannels = {
            [ORIGINAL_NAME_KEYS.x]: 'x',
            [ORIGINAL_NAME_KEYS.y]: 'Frequency',
            insetLeft: 0.5,
            insetRight: 0.5
        };

        expect(data).toEqual(expectedOutputData);
        expect(channels).toStrictEqual(expect.objectContaining(expectedChannels));
    });

    const dailyData = range(31).map((d) => ({
        x: new Date(`2020-01-${d + 1}`),
        y: d
    }));

    it('bins daily into weekly data', () => {
        const { data, ...channels } = binX(
            {
                data: dailyData,
                x: 'x',
                y: 'y'
            },
            {
                interval: 'week',
                y: 'mean'
            }
        );

        const expectedChannels = {
            [ORIGINAL_NAME_KEYS.x]: 'x',
            [ORIGINAL_NAME_KEYS.y]: 'Average ( y )',
            insetLeft: 0.5,
            insetRight: 0.5
        };

        expect(channels).toStrictEqual(expect.objectContaining(expectedChannels));

        // Check individual properties instead of the entire object
        // This avoids issues with whitespace or property order
        expect(data).toHaveLength(5);

        // Make the test timezone-agnostic by checking date properties rather than exact date objects
        const firstBin = data[0];
        expect((firstBin as any)[channels.y as any]).toBe(1.5);

        // Check that the dates are roughly a week apart (5-7 days)
        const x1Time = (firstBin as any)[channels.x1 as any].getTime();
        const x2Time = (firstBin as any)[channels.x2 as any].getTime();
        const xTime = (firstBin as any)[channels.x as any].getTime();

        // Check that x is approximately in the middle of x1 and x2
        expect(xTime).toBeGreaterThan(x1Time);
        expect(xTime).toBeLessThan(x2Time);

        // Verify the bin covers about a week (4-7 days in milliseconds based on implementation)
        const binDuration = x2Time - x1Time;
        expect(binDuration).toBeGreaterThanOrEqual(4 * 24 * 60 * 60 * 1000);
        expect(binDuration).toBeLessThanOrEqual(7 * 24 * 60 * 60 * 1000);
    });

    // it.only('bins daily into weekly data', () => {
    //     const { data, ...channels } = binX(
    //         {
    //             data: dailyData,
    //             x: 'x',
    //             y1: 'y',
    //             y2: 'y'
    //         },
    //         {
    //             interval: 'week',
    //             y1: 'min',
    //             y2: 'max'
    //         }
    //     );
    //     console.log({ data, channels });
    //     expect(channels).toEqual({
    //         insetLeft: 0.5,
    //         insetRight: 0.5,
    //         x: '__x',
    //         y: '__y',
    //         x1: '__x1',
    //         x2: '__x2',
    //         __x_origField: 'x',
    //         __y_origField: 'Average ( y )'
    //     });
    //     expect(data).toHaveLength(5);
    //     expect(data[0]).toEqual({
    //         __x1: new Date('2019-12-31T23:00:00.000Z'),
    //         __x2: new Date('2020-01-04T23:00:00.000Z'),
    //         __x: new Date('2020-01-02T23:00:00.000Z'),
    //         __y: 1.5
    //     });
    // });
});

describe('bin', () => {
    it('bins on x and y with explicit thresholds (numeric)', () => {
        const data = [
            { x: 0.5, y: 0.5 },
            { x: 0.75, y: 0.8 },
            { x: 1.5, y: 3.5 },
            { x: 2.5, y: 1.5 },
            { x: 4.5, y: 4.5 }
        ];

        const { data: binned, ...channels } = bin(
            { data, x: 'x', y: 'y' },
            { thresholds: [2, 4], fill: 'count' }
        );

        // channel mappings and metadata
        expect(channels[ORIGINAL_NAME_KEYS.x]).toBe('x');
        expect(channels[ORIGINAL_NAME_KEYS.y]).toBe('y');
        expect(channels.inset).toBe(0.5);

        // DEBUG: inspect records during development
        // console.log(
        //     binned.map((d) => ({
        //         x1: (d as any)[channels.x1 as any],
        //         x: (d as any)[channels.x as any],
        //         x2: (d as any)[channels.x2 as any],
        //         y1: (d as any)[channels.y1 as any],
        //         y: (d as any)[channels.y as any],
        //         y2: (d as any)[channels.y2 as any],
        //         c: (d as any)[channels.fill as any]
        //     }))
        // );

        // should produce 4 occupied bins
        expect(binned).toHaveLength(4);

        // Each input point should map to exactly one bin
        const maxXR = Math.max(
            ...binned.map((d) =>
                Number.isFinite((d as any)[channels.x2 as any])
                    ? (d as any)[channels.x2 as any]
                    : -Infinity
            )
        );
        const maxYT = Math.max(
            ...binned.map((d) =>
                Number.isFinite((d as any)[channels.y2 as any])
                    ? (d as any)[channels.y2 as any]
                    : -Infinity
            )
        );

        for (const p of data) {
            const matches = binned.filter((d) => {
                const xl = (d as any)[channels.x1 as any] ?? -Infinity;
                const xr = (d as any)[channels.x2 as any] ?? Infinity;
                const yb = (d as any)[channels.y1 as any] ?? -Infinity;
                const yt = (d as any)[channels.y2 as any] ?? Infinity;
                const lastX = Number.isFinite(xr) && xr === maxXR;
                const lastY = Number.isFinite(yt) && yt === maxYT;
                const inX = p.x >= xl && (lastX ? p.x <= xr : p.x < xr);
                const inY = p.y >= yb && (lastY ? p.y <= yt : p.y < yt);
                return inX && inY;
            });
            expect(matches.length).toBe(1);
        }

        // Sum of counts equals number of input points
        const total = binned.reduce((acc, d) => acc + (d as any)[channels.fill as any], 0);
        expect(total).toBe(data.length);

        // For bins with both bounds defined, center equals midpoint
        for (const d of binned) {
            const xl = (d as any)[channels.x1 as any];
            const xr = (d as any)[channels.x2 as any];
            const yb = (d as any)[channels.y1 as any];
            const yt = (d as any)[channels.y2 as any];
            if (Number.isFinite(xl) && Number.isFinite(xr)) {
                expect((d as any)[channels.x as any]).toBe((xl + xr) / 2);
            }
            if (Number.isFinite(yb) && Number.isFinite(yt)) {
                expect((d as any)[channels.y as any]).toBe((yb + yt) / 2);
            }
        }
    });

    it('bins on x and y with numeric interval', () => {
        const data = [
            { x: 0.5, y: 0.5 },
            { x: 0.75, y: 0.8 },
            { x: 1.5, y: 3.5 },
            { x: 2.5, y: 1.5 },
            { x: 4.5, y: 4.5 }
        ];

        const { data: binned, ...channels } = bin(
            { data, x: 'x', y: 'y' },
            { interval: 1, fill: 'count' }
        );

        // channel mappings
        expect(typeof channels.x).toBe('symbol');
        expect(typeof channels.y).toBe('symbol');
        expect(channels[ORIGINAL_NAME_KEYS.x]).toBe('x');
        expect(channels[ORIGINAL_NAME_KEYS.y]).toBe('y');
        expect(channels.inset).toBe(0.5);

        // should produce 4 occupied bins
        expect(binned).toHaveLength(4);

        // Each input point should map to exactly one bin
        const maxXR = Math.max(
            ...binned.map((d) =>
                Number.isFinite((d as any)[channels.x2 as any])
                    ? (d as any)[channels.x2 as any]
                    : -Infinity
            )
        );
        const maxYT = Math.max(
            ...binned.map((d) =>
                Number.isFinite((d as any)[channels.y2 as any])
                    ? (d as any)[channels.y2 as any]
                    : -Infinity
            )
        );

        for (const p of data) {
            const matches = binned.filter((d) => {
                const xl = (d as any)[channels.x1 as any] ?? -Infinity;
                const xr = (d as any)[channels.x2 as any] ?? Infinity;
                const yb = (d as any)[channels.y1 as any] ?? -Infinity;
                const yt = (d as any)[channels.y2 as any] ?? Infinity;
                const lastX = Number.isFinite(xr) && xr === maxXR;
                const lastY = Number.isFinite(yt) && yt === maxYT;
                const inX = p.x >= xl && (lastX ? p.x <= xr : p.x < xr);
                const inY = p.y >= yb && (lastY ? p.y <= yt : p.y < yt);
                return inX && inY;
            });
            expect(matches.length).toBe(1);
        }

        // Sum of counts equals number of input points
        const total = binned.reduce((acc, d) => acc + (d as any)[channels.fill as any], 0);
        expect(total).toBe(data.length);

        // For bins with both bounds defined, center equals midpoint
        for (const d of binned) {
            const xl = (d as any)[channels.x1 as any];
            const xr = (d as any)[channels.x2 as any];
            const yb = (d as any)[channels.y1 as any];
            const yt = (d as any)[channels.y2 as any];
            if (Number.isFinite(xl) && Number.isFinite(xr)) {
                expect((d as any)[channels.x as any]).toBe((xl + xr) / 2);
            }
            if (Number.isFinite(yb) && Number.isFinite(yt)) {
                expect((d as any)[channels.y as any]).toBe((yb + yt) / 2);
            }
        }
    });
});
