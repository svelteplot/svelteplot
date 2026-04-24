import { parseTimeInterval } from './time.js';
import { describe, it, expect } from 'vitest';

describe('time helpers', () => {
    describe('parseTimeInterval', () => {
        it('should parse the time interval correctly', () => {
            expect(parseTimeInterval('1 second')).toEqual(['second', 1]);
            expect(parseTimeInterval('2 minutes')).toEqual(['minute', 2]);
            expect(parseTimeInterval('3 hours')).toEqual(['hour', 3]);
            expect(parseTimeInterval('4 days')).toEqual(['day', 4]);
            expect(parseTimeInterval('5 weeks')).toEqual(['week', 5]);
            expect(parseTimeInterval('6 months')).toEqual(['month', 6]);
            expect(parseTimeInterval('7 quarters')).toEqual(['month', 21]);
            expect(parseTimeInterval('8 half')).toEqual(['month', 48]);
        });

        it('should throw an error if the time interval is invalid', () => {
            expect(() => parseTimeInterval('invalid')).toThrow();
        });

        // BEGIN: Additional tests for parseTimeInterval
        it('should drop plural "s" from the interval name', () => {
            expect(parseTimeInterval('seconds')).toEqual(['second', 1]);
            expect(parseTimeInterval('minutes')).toEqual(['minute', 1]);
            expect(parseTimeInterval('hours')).toEqual(['hour', 1]);
            expect(parseTimeInterval('days')).toEqual(['day', 1]);
            expect(parseTimeInterval('weeks')).toEqual(['week', 1]);
            expect(parseTimeInterval('months')).toEqual(['month', 1]);
        });

        it('should handle numeric prefix in the interval name', () => {
            expect(parseTimeInterval('10 seconds')).toEqual(['second', 10]);
            expect(parseTimeInterval('20 minutes')).toEqual(['minute', 20]);
            expect(parseTimeInterval('30 hours')).toEqual(['hour', 30]);
            expect(parseTimeInterval('40 days')).toEqual(['day', 40]);
            expect(parseTimeInterval('50 weeks')).toEqual(['week', 50]);
            expect(parseTimeInterval('60 months')).toEqual(['month', 60]);
        });

        it('should convert "quarter" to "month" and multiply the period by 3', () => {
            expect(parseTimeInterval('1 quarter')).toEqual(['month', 3]);
            expect(parseTimeInterval('2 quarters')).toEqual(['month', 6]);
            expect(parseTimeInterval('3 quarters')).toEqual(['month', 9]);
        });

        it('should convert "half" to "month" and multiply the period by 6', () => {
            expect(parseTimeInterval('1 half')).toEqual(['month', 6]);
            expect(parseTimeInterval('2 half')).toEqual(['month', 12]);
            expect(parseTimeInterval('3 half')).toEqual(['month', 18]);
        });

        it('should throw an error for unknown intervals', () => {
            expect(() => parseTimeInterval('halloween')).toThrow();
        });
        // END: Additional tests for parseTimeInterval
    });

    // describe('maybeTimeInterval', () => {
    //     it('should return the time interval as an interval object', () => {
    //         expect(maybeTimeInterval('1 second')).toEqual({ unit: 'second', value: 1 });
    //         expect(maybeTimeInterval('2 minutes')).toEqual({ unit: 'minute', value: 2 });
    //         expect(maybeTimeInterval('3 hours')).toEqual({ unit: 'hour', value: 3 });
    //         expect(maybeTimeInterval('4 days')).toEqual({ unit: 'day', value: 4 });
    //         expect(maybeTimeInterval('5 weeks')).toEqual({ unit: 'week', value: 5 });
    //         expect(maybeTimeInterval('6 months')).toEqual({ unit: 'month', value: 6 });
    //         expect(maybeTimeInterval('7 quarters')).toEqual({ unit: 'month', value: 21 });
    //         expect(maybeTimeInterval('8 half')).toEqual({ unit: 'month', value: 48 });
    //     });

    //     it('should throw an error if the time interval is invalid', () => {
    //         expect(() => maybeTimeInterval('invalid')).toThrow();
    //     });

    //     // Additional tests for maybeTimeInterval
    //     it('should return null if the input is null', () => {
    //         expect(maybeTimeInterval(null)).toBeNull();
    //     });

    //     it('should return null if the input is undefined', () => {
    //         expect(maybeTimeInterval(undefined)).toBeNull();
    //     });

    //     it('should return null if the input is an empty string', () => {
    //         expect(maybeTimeInterval('')).toBeNull();
    //     });
    // });
});
