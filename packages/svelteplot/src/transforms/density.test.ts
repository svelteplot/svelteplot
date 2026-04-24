import { describe, it, expect, vi } from 'vitest';
import { densityX } from './density.js';
import type { DataRecord } from '../types/index.js';

const integrate = (points: { x: number; y: number }[]) => {
    const first = points.findIndex((p) => p.y > 0);
    const last = points.length - 1 - [...points].reverse().findIndex((p) => p.y > 0);
    if (first === -1 || last < first) return 0;

    let area = 0;
    for (let i = first; i < last; i++) {
        const dx = points[i + 1].x - points[i].x;
        area += ((points[i].y + points[i + 1].y) / 2) * dx;
    }
    return area;
};

describe('density transform', () => {
    it('computes density with different kernels', () => {
        const input = {
            data: [{ value: -1 }, { value: 0 }, { value: 1 }],
            x: 'value'
        };
        const baseOptions = { bandwidth: 1, interval: 1, trim: true };

        const uniform = densityX<DataRecord>(input, { ...baseOptions, kernel: 'uniform' });
        const gaussian = densityX<DataRecord>(input, { ...baseOptions, kernel: 'gaussian' });

        const uniformX = uniform.x as string;
        const uniformY = uniform.y as string;
        expect(uniform.data.map((d) => d[uniformX])).toEqual([-1, 0, 1]);
        [1 / 3, 0.5, 1 / 3].forEach((expected, i) =>
            expect(uniform.data[i][uniformY]).toBeCloseTo(expected, 6)
        );

        const gaussianX = gaussian.x as string;
        const gaussianY = gaussian.y as string;
        expect(gaussian.data.map((d) => d[gaussianX])).toEqual([-1, 0, 1]);
        [0.231634657144588, 0.2942945764799065, 0.23163465714458806].forEach((expected, i) =>
            expect(gaussian.data[i][gaussianY]).toBeCloseTo(expected, 6)
        );

        expect(gaussian.data[1][gaussianY]).toBeLessThan(uniform.data[1][uniformY] as number);
    });

    it('integrates to ~1 for basic density', () => {
        const { data, ...channels } = densityX<DataRecord>(
            {
                data: [{ value: 0 }, { value: 5 }],
                x: 'value'
            },
            { bandwidth: 1, interval: 0.1, trim: false, kernel: 'uniform' }
        );

        const series = data
            .map((d) => ({
                x: d[channels.x as string] as number,
                y: d[channels.y as string] as number
            }))
            .sort((a, b) => a.x - b.x);
        expect(integrate(series)).toBeCloseTo(1, 1);
    });

    it('weights samples when computing density', () => {
        const input = {
            data: [
                { value: 0, weight: 1 },
                { value: 1, weight: 3 }
            ],
            x: 'value',
            weight: (d: DataRecord) => d.weight
        };

        const { data, ...channels } = densityX<DataRecord>(input, {
            bandwidth: 1,
            interval: 1,
            trim: true,
            kernel: 'triangular'
        });

        expect(data.map((d) => d[channels.x as string])).toEqual([0, 1]);
        expect(data.map((d) => d[channels.y as string])).toEqual([0.25, 0.75]);
    });

    it('integrates to ~1 with weights', () => {
        const { data, ...channels } = densityX<DataRecord>(
            {
                data: [
                    { value: 0, w: 1 },
                    { value: 5, w: 3 }
                ],
                x: 'value',
                weight: (d: DataRecord) => d.w
            },
            { bandwidth: 1, interval: 0.1, trim: false, kernel: 'uniform' }
        );

        const series = data
            .map((d) => ({
                x: d[channels.x as string] as number,
                y: d[channels.y as string] as number
            }))
            .sort((a, b) => a.x - b.x);
        expect(integrate(series)).toBeCloseTo(1, 1);
    });

    it('returns cumulative density (ascending)', () => {
        const { data, ...channels } = densityX<DataRecord>(
            {
                data: [{ value: 0 }, { value: 5 }],
                x: 'value'
            },
            { bandwidth: 1, interval: 0.5, trim: false, kernel: 'uniform', cumulative: 1 }
        );

        const series = data
            .map((d) => ({
                x: d[channels.x as string] as number,
                y: d[channels.y as string] as number
            }))
            .sort((a, b) => a.x - b.x);

        expect(series[0].y).toBeCloseTo(0, 2);
        expect(series.at(-1)?.y ?? 0).toBeCloseTo(1, 1);
        for (let i = 1; i < series.length; i++) {
            expect(series[i].y).toBeGreaterThanOrEqual(series[i - 1].y);
        }
    });

    it('returns cumulative density (descending)', () => {
        const { data, ...channels } = densityX<DataRecord>(
            {
                data: [{ value: 0 }, { value: 5 }],
                x: 'value'
            },
            { bandwidth: 1, interval: 0.5, trim: false, kernel: 'uniform', cumulative: -1 }
        );

        const series = data
            .map((d) => ({
                x: d[channels.x as string] as number,
                y: d[channels.y as string] as number
            }))
            .sort((a, b) => a.x - b.x);

        expect(series[0].y).toBeCloseTo(1, 1);
        expect(series.at(-1)?.y ?? 0).toBeLessThanOrEqual(0.2);
        for (let i = 1; i < series.length; i++) {
            expect(series[i].y).toBeLessThanOrEqual(series[i - 1].y);
        }
    });

    it('respects trim option to avoid padded evaluation ranges', () => {
        const input = {
            data: [
                { value: 0, facet: 'A' },
                { value: 5, facet: 'A' }
            ],
            x: 'value'
        };

        const defaultTrim = densityX<DataRecord>(input, { bandwidth: 1, interval: 1 });
        const trimmed = densityX<DataRecord>(input, { bandwidth: 1, interval: 1, trim: true });

        const xDefault = defaultTrim.x as string;
        const xTrimmed = trimmed.x as string;

        expect(defaultTrim.data.map((d) => d[xDefault])).toEqual([-1, 0, 1, 2, 3, 4, 5]);
        expect(trimmed.data.map((d) => d[xTrimmed])).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('applies Silverman bandwidth with kernel-specific scaling', () => {
        const bandwidthSpy = vi.fn(() => 1);

        const { data, ...channels } = densityX<DataRecord>(
            {
                data: [{ value: 0 }],
                x: 'value'
            },
            { bandwidth: bandwidthSpy, kernel: 'epanechnikov', interval: 1, trim: true }
        );

        expect(bandwidthSpy).toHaveBeenCalledWith([0]);
        expect(data[0][channels.y as string]).toBeCloseTo(0.75 / 2.34, 6);
    });

    it('drops items with invalid weights', () => {
        const { data, ...channels } = densityX<DataRecord>(
            {
                data: [
                    { value: 0, w: 1 },
                    { value: 2, w: -1 }
                ],
                weight: (d: DataRecord) => d.w,
                x: 'value'
            },
            { bandwidth: 1, interval: 1, trim: true }
        );

        expect(data).toHaveLength(1);
        expect(data[0][channels.x as string]).toBe(0);
        expect(data[0][channels.y as string]).toBeCloseTo(0.75, 6);
    });

    it('groups densities by fill and facet channels', () => {
        const input = {
            data: [
                { fx: 'A', fill: 'red', value: 0 },
                { fx: 'A', fill: 'red', value: 5 },
                { fx: 'A', fill: 'blue', value: 0 },
                { fx: 'A', fill: 'blue', value: 5 },
                { fx: 'B', fill: 'red', value: 0 },
                { fx: 'B', fill: 'red', value: 5 },
                { fx: 'B', fill: 'blue', value: 0 },
                { fx: 'B', fill: 'blue', value: 5 }
            ],
            x: 'value',
            fill: 'fill',
            fx: 'fx'
        };

        const { data, ...channels } = densityX<DataRecord>(input, {
            bandwidth: 1,
            interval: 0.1,
            trim: false,
            kernel: 'uniform'
        });

        expect(channels.fill).toBe('fill');
        expect(channels.fx).toBe('fx');

        const grouped = new Map<string, { x: number; y: number }[]>();
        for (const row of data) {
            const key = `${row[channels.fx as string] as string}-${row[channels.fill as string] as string}`;
            const arr = grouped.get(key) ?? [];
            arr.push({
                x: row[channels.x as string] as number,
                y: row[channels.y as string] as number
            });
            grouped.set(key, arr);
        }

        expect([...grouped.keys()].sort()).toEqual(['A-blue', 'A-red', 'B-blue', 'B-red']);
        for (const [, values] of grouped) {
            const sorted = values.sort((a, b) => a.x - b.x);
            expect(sorted.some((d) => d.y > 0)).toBe(true);
            expect(integrate(sorted)).toBeCloseTo(1, 1);
        }
    });
});
