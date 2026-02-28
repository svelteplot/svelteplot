import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import UtcScaleTest from './utcScale.test.svelte';
import { VALID_SCALE_TYPES } from '$lib/constants.js';
import { isTemporalScale } from '$lib/helpers/typeChecks.js';
import { inferScaleType } from '$lib/helpers/scales.js';
import autoTimeFormat from '$lib/helpers/autoTimeFormat.js';
import type { PlotScale } from '$lib/types/index.js';

describe('UTC scale type', () => {
    describe('VALID_SCALE_TYPES', () => {
        it('includes utc in x scale types', () => {
            expect(VALID_SCALE_TYPES.x.has('utc')).toBe(true);
        });

        it('includes utc in y scale types', () => {
            expect(VALID_SCALE_TYPES.y.has('utc')).toBe(true);
        });

        it('does not include utc in color scale types', () => {
            expect(VALID_SCALE_TYPES.color.has('utc' as any)).toBe(false);
        });
    });

    describe('isTemporalScale', () => {
        it('returns true for time', () => {
            expect(isTemporalScale('time')).toBe(true);
        });

        it('returns true for utc', () => {
            expect(isTemporalScale('utc')).toBe(true);
        });

        it('returns false for linear', () => {
            expect(isTemporalScale('linear')).toBe(false);
        });

        it('returns false for band', () => {
            expect(isTemporalScale('band')).toBe(false);
        });
    });

    describe('inferScaleType', () => {
        it('returns time (not utc) for date values — utc must be explicit', () => {
            const dates = [new Date('2025-01-01'), new Date('2025-06-01')];
            expect(inferScaleType('x', dates, new Set())).toBe('time');
        });
    });

    // maybeInterval UTC routing tests live in src/lib/helpers/autoTicks.test.ts

    describe('autoTimeFormat with UTC', () => {
        it('formats midnight UTC correctly with utc=true', () => {
            const scale: PlotScale = {
                type: 'utc',
                domain: [new Date('2025-06-01T00:00:00Z'), new Date('2025-09-01T00:00:00Z')],
                range: [0, 400],
                fn: (() => 0) as any,
                skip: new Map(),
                manualActiveMarks: 0,
                uniqueScaleProps: new Set()
            };
            const format = autoTimeFormat(scale, 400, 'en-US');
            // For a date at midnight UTC, the format should not show an offset time
            const result = format(new Date('2025-08-01T00:00:00Z'));
            expect(result).toBeInstanceOf(Array);
            expect(result.length).toBeGreaterThan(0);
            // Should contain "Aug" for the month
            expect(result.join(' ')).toMatch(/Aug/);
        });

        it('formats with local time when type is time', () => {
            const scale: PlotScale = {
                type: 'time',
                domain: [new Date('2025-06-01T00:00:00Z'), new Date('2025-09-01T00:00:00Z')],
                range: [0, 400],
                fn: (() => 0) as any,
                skip: new Map(),
                manualActiveMarks: 0,
                uniqueScaleProps: new Set()
            };
            const format = autoTimeFormat(scale, 400, 'en-US');
            const result = format(new Date('2025-08-01T00:00:00Z'));
            expect(result).toBeInstanceOf(Array);
            expect(result.length).toBeGreaterThan(0);
        });
    });

    describe('rendering', () => {
        it('renders a plot with x type utc without errors', () => {
            const { container } = render(UtcScaleTest, {
                props: {
                    plotArgs: {
                        width: 400,
                        x: {
                            type: 'utc',
                            domain: [
                                new Date('2025-06-15T00:00:00Z'),
                                new Date('2025-09-15T00:00:00Z')
                            ]
                        }
                    }
                }
            });

            const ticks = container.querySelectorAll(
                'g.axis-x > g.tick'
            ) as NodeListOf<SVGGElement>;
            expect(ticks.length).toBeGreaterThan(0);
            // Verify tick labels are present
            const tickValues = Array.from(ticks).map((t) => t.querySelector('text')?.textContent);
            expect(tickValues.length).toBeGreaterThan(0);
            tickValues.forEach((v) => expect(v).toBeTruthy());
        });

        it('renders utc ticks with time interval', () => {
            const { container } = render(UtcScaleTest, {
                props: {
                    plotArgs: {
                        width: 400,
                        x: {
                            type: 'utc',
                            domain: [
                                new Date('2025-01-01T00:00:00Z'),
                                new Date('2025-12-31T00:00:00Z')
                            ]
                        }
                    },
                    axisArgs: { ticks: '3 months' }
                }
            });

            const ticks = container.querySelectorAll(
                'g.axis-x > g.tick'
            ) as NodeListOf<SVGGElement>;
            expect(ticks.length).toBeGreaterThan(0);
        });
    });
});
