import { describe, it, expect } from 'vitest';
import { intervalX, intervalY } from './interval.js';
import type { DataRecord } from '../types/index.js';

describe('intervalX', () => {
    it('should calculate x1 and x2 based on interval', () => {
        const data: DataRecord[] = [{ x: 5 }, { x: 15 }];
        const options = { interval: 10, x: 'x' };

        const result = intervalX<DataRecord>({ data, ...options });

        expect(result.data).toEqual([
            { x: 5, __x1: 0, __x2: 10 },
            { x: 15, __x1: 10, __x2: 20 }
        ]);
        expect((result as Record<string, unknown>)['x1']).toBe('__x1');
        expect((result as Record<string, unknown>)['x2']).toBe('__x2');
    });

    it('should handle time-based intervals (e.g., days)', () => {
        const data: DataRecord[] = [
            { x: new Date('2025-04-15T05:00:00Z') },
            { x: new Date('2025-04-16T12:00:00Z') },
            { x: new Date('2025-04-16T18:00:00Z') },
            { x: new Date('2025-04-16T23:00:00Z') },
            { x: new Date('2025-04-17T02:00:00Z') },
            { x: new Date('2025-04-17T10:00:00Z') },
            { x: new Date('2025-04-17T12:00:00Z') }
        ];
        const options = { interval: '1 day', x: 'x', type: 'time' }; // 1 day in milliseconds

        const result = intervalX<DataRecord>({ data, ...options });

        // Test channel setup
        expect((result as Record<string, unknown>)['x1']).toBe('__x1');
        expect((result as Record<string, unknown>)['x2']).toBe('__x2');

        // Verify result length
        expect(result.data).toHaveLength(7);

        // Check result data in a timezone-agnostic way
        for (let i = 0; i < result.data.length; i++) {
            const item = result.data[i] as DataRecord;
            const originalDate = (data[i] as DataRecord).x;

            // Verify x value is preserved
            expect(item['x']).toEqual(originalDate);

            // Check that x1 and x2 represent day boundaries
            const x1Time = (item['__x1'] as Date).getTime();
            const x2Time = (item['__x2'] as Date).getTime();
            const xTime = (item['x'] as Date).getTime();

            // x1 should be before x
            expect(x1Time).toBeLessThanOrEqual(xTime);

            // x2 should be after x
            expect(x2Time).toBeGreaterThan(xTime);

            // Interval between x1 and x2 should be approximately 1 day
            const dayDuration = x2Time - x1Time;
            expect(dayDuration).toBeGreaterThanOrEqual(23 * 60 * 60 * 1000); // at least 23 hours
            expect(dayDuration).toBeLessThanOrEqual(25 * 60 * 60 * 1000); // at most 25 hours

            // Check for logical interval boundaries
            // Items on the same day should have x values within the same interval boundaries
            // or in consecutive intervals based on the implementation
            if (i > 0) {
                const prevItem = result.data[i - 1] as DataRecord;
                const currDate = new Date(originalDate as string | number | Date);
                const prevDate = new Date((data[i - 1] as DataRecord).x as string | number | Date);

                // Just check that a specific x value has a specific interval range
                // but don't assume all items with the same calendar day have the same interval

                // Instead, check that interval boundaries are consistent with the interval value (1 day)
                if (currDate.getTime() - prevDate.getTime() < 24 * 60 * 60 * 1000) {
                    // For entries close together (less than a day apart), they should either:
                    // 1. Have the same interval boundaries, or
                    // 2. Have adjacent interval boundaries

                    const sameIntervals =
                        (prevItem['__x1'] as Date).getTime() === (item['__x1'] as Date).getTime() &&
                        (prevItem['__x2'] as Date).getTime() === (item['__x2'] as Date).getTime();

                    const adjacentIntervals =
                        (item['__x1'] as Date).getTime() === (prevItem['__x2'] as Date).getTime() ||
                        (prevItem['__x1'] as Date).getTime() === (item['__x2'] as Date).getTime();

                    expect(sameIntervals || adjacentIntervals).toBeTruthy();
                }
            }
        }
    });
});

describe('intervalY', () => {
    it('should calculate y1 and y2 based on interval', () => {
        const data: DataRecord[] = [{ y: 7 }, { y: 17 }];
        const options = { interval: 10, y: 'y' };

        const result = intervalY<DataRecord>({ data, ...options });

        expect(result.data).toEqual([
            { y: 7, __y1: 0, __y2: 10 },
            { y: 17, __y1: 10, __y2: 20 }
        ]);
        expect((result as Record<string, unknown>)['y1']).toBe('__y1');
        expect((result as Record<string, unknown>)['y2']).toBe('__y2');
    });

    it('should handle time-based intervals (e.g., days)', () => {
        const data: DataRecord[] = [
            { y: new Date('2025-04-16T12:00:00Z') },
            { y: new Date('2025-04-17T12:00:00Z') }
        ];
        const options = { interval: '2 days', y: 'y' }; // 2 days interval

        const result = intervalY<DataRecord>({ data, ...options });

        // Test channel setup
        expect((result as Record<string, unknown>)['y1']).toBe('__y1');
        expect((result as Record<string, unknown>)['y2']).toBe('__y2');

        // Verify result length
        expect(result.data).toHaveLength(2);

        // Check result data in a timezone-agnostic way
        for (let i = 0; i < result.data.length; i++) {
            const item = result.data[i] as DataRecord;
            const originalDate = (data[i] as DataRecord).y;

            // Verify y value is preserved
            expect(item['y']).toEqual(originalDate);

            // Check that y1 and y2 represent appropriate interval boundaries
            const y1Time = (item['__y1'] as Date).getTime();
            const y2Time = (item['__y2'] as Date).getTime();
            const yTime = (item['y'] as Date).getTime();

            // y1 should be before y
            expect(y1Time).toBeLessThan(yTime);

            // y2 should be after y
            expect(y2Time).toBeGreaterThan(yTime);

            // Interval between y1 and y2 should be approximately 2 days
            const intervalDuration = y2Time - y1Time;
            expect(intervalDuration).toBeGreaterThanOrEqual(47 * 60 * 60 * 1000); // at least 47 hours
            expect(intervalDuration).toBeLessThanOrEqual(49 * 60 * 60 * 1000); // at most 49 hours
        }

        // First bin should end where second bin starts
        expect((result.data[0] as DataRecord)['__y2']).toEqual(
            (result.data[1] as DataRecord)['__y1']
        );
    });
});
