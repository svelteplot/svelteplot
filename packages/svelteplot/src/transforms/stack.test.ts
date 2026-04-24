import { describe, it, expect } from 'vitest';
import { stackX, stackY, stackMosaicX, stackMosaicY } from './stack.js';
import type { DataRecord, DataRow } from '../types/index.js';
import { recordizeX, recordizeY } from './recordize.js';

describe('stackY transform', () => {
    const data: DataRecord[] = [
        { year: 1, category: 'A', value: 10 },
        { year: 1, category: 'B', value: 20 },
        { year: 2, category: 'A', value: 30 },
        { year: 2, category: 'B', value: 40 }
    ];

    it('basic stacking', () => {
        const { data: stackedData, ...channels } = stackY<DataRecord>({
            data,
            x: 'year',
            fill: 'category',
            y: 'value'
        });
        expect(stackedData).toHaveLength(data.length);
        expect(channels.x).toBeDefined();
        expect(channels.y1).toBeDefined();
        expect(channels.y2).toBeDefined();

        const result = stackedData.map((d) => ({
            x: d[channels.x as string],
            y1: d[channels.y1 as string],
            y2: d[channels.y2 as string],
            fill: d[channels.fill as string]
        }));
        expect(result).toEqual([
            { x: 1, y1: 0, y2: 10, fill: 'A' },
            { x: 1, y1: 10, y2: 30, fill: 'B' },
            { x: 2, y1: 0, y2: 30, fill: 'A' },
            { x: 2, y1: 30, y2: 70, fill: 'B' }
        ]);
    });

    it('centered stacking', () => {
        const { data: stackedData, ...channels } = stackY<DataRecord>(
            {
                data,
                x: 'year',
                fill: 'category',
                y: 'value'
            },
            { offset: 'center' }
        );
        expect(stackedData).toHaveLength(data.length);
        expect(channels.x).toBeDefined();
        expect(channels.y1).toBeDefined();
        expect(channels.y2).toBeDefined();
        const result = stackedData.map((d) => ({
            x: d[channels.x as string],
            y1: d[channels.y1 as string],

            y2: d[channels.y2 as string],
            fill: d[channels.fill as string]
        }));
        expect(result).toEqual([
            { x: 1, y1: -15, y2: -5, fill: 'A' },
            { x: 1, y1: -5, y2: 15, fill: 'B' },
            { x: 2, y1: -35, y2: -5, fill: 'A' },
            { x: 2, y1: -5, y2: 35, fill: 'B' }
        ]);
    });

    it('normalized stacking', () => {
        const { data: stackedData, ...channels } = stackY<DataRecord>(
            {
                data,
                x: 'year',
                fill: 'category',
                y: 'value'
            },
            { offset: 'normalize' }
        );
        expect(stackedData).toHaveLength(data.length);
        expect(channels.x).toBeDefined();
        expect(channels.y1).toBeDefined();
        expect(channels.y2).toBeDefined();
        const result = stackedData.map((d) => ({
            x: d[channels.x as string],
            y1: d[channels.y1 as string],

            y2: d[channels.y2 as string],
            fill: d[channels.fill as string]
        }));
        expect(result).toEqual([
            { x: 1, y1: 0, y2: 0.3333333333333333, fill: 'A' },
            { x: 1, y1: 0.3333333333333333, y2: 1, fill: 'B' },
            { x: 2, y1: 0, y2: 0.42857142857142855, fill: 'A' },
            { x: 2, y1: 0.42857142857142855, y2: 1, fill: 'B' }
        ]);
    });

    it('facet stacking', () => {
        const data2: DataRecord[] = [
            { year: 1, category: 'A', value: 10, facet: 'X' },
            { year: 1, category: 'B', value: 20, facet: 'X' },
            { year: 2, category: 'A', value: 30, facet: 'X' },
            { year: 2, category: 'B', value: 40, facet: 'X' },
            { year: 1, category: 'A', value: 15, facet: 'Y' },
            { year: 1, category: 'B', value: 25, facet: 'Y' },
            { year: 2, category: 'A', value: 35, facet: 'Y' },
            { year: 2, category: 'B', value: 45, facet: 'Y' }
        ];

        const { data: stackedData, ...channels } = stackY<DataRecord>({
            data: data2,
            x: 'year',
            fill: 'category',
            y: 'value',
            fx: 'facet'
        });
        expect(stackedData).toHaveLength(data2.length);
        const result = stackedData.map((d) => ({
            x: d[channels.x as string],
            y1: d[channels.y1 as string],
            y2: d[channels.y2 as string],
            fx: d[channels.fx as string],
            fill: d[channels.fill as string]
        }));
        expect(result).toEqual([
            { x: 1, y1: 0, y2: 10, fx: 'X', fill: 'A' },
            { x: 1, y1: 10, y2: 30, fx: 'X', fill: 'B' },
            { x: 2, y1: 0, y2: 30, fx: 'X', fill: 'A' },
            { x: 2, y1: 30, y2: 70, fx: 'X', fill: 'B' },
            { x: 1, y1: 0, y2: 15, fx: 'Y', fill: 'A' },
            { x: 1, y1: 15, y2: 40, fx: 'Y', fill: 'B' },
            { x: 2, y1: 0, y2: 35, fx: 'Y', fill: 'A' },
            { x: 2, y1: 35, y2: 80, fx: 'Y', fill: 'B' }
        ]);
    });

    it('unit stacking', () => {
        const data3: DataRecord[] = [
            { make: 'A', model: 'A1', mpg: 100 },
            { make: 'A', model: 'A2', mpg: 200 },
            { make: 'B', model: 'B1', mpg: 300 },
            { make: 'B', model: 'B2', mpg: 400 },
            { make: 'B', model: 'B3', mpg: 450 }
        ];
        const { data: stackedData } = stackY<DataRecord>({
            data: data3,
            x: 'make',
            y: 'mpg'
            // fill: 'make'
        });
        expect(stackedData).toHaveLength(data3.length);
    });

    it('stacks recordized array', () => {
        const data = [10, 20, 30, 40];
        const { data: stackedData, ...channels } = stackY(
            recordizeY({ data, x1: null, x2: null, y1: 0, y2: 0 })
        );
        const { x, y1, y2 } = channels;
        const result = stackedData.map((d) => ({
            x: d[x as string],
            y1: d[y1 as string],
            y2: d[y2 as string]
        }));
        expect(result).toEqual([
            { x: 0, y1: 0, y2: 10 },
            { x: 1, y1: 0, y2: 20 },
            { x: 2, y1: 0, y2: 30 },
            { x: 3, y1: 0, y2: 40 }
        ]);
    });
});

describe('stackX transform', () => {
    const data: DataRecord[] = [
        { year: 1, category: 'A', value: 10 },
        { year: 1, category: 'B', value: 20 },
        { year: 2, category: 'A', value: 30 },
        { year: 2, category: 'B', value: 40 }
    ];

    it('basic stacking', () => {
        const { data: stackedData, ...channels } = stackX<DataRecord>({
            data,
            y: 'year',
            fill: 'category',
            x: 'value',
            value: 'value'
        });
        expect(stackedData).toHaveLength(data.length);
        expect(channels.y).toBeDefined();
        expect(channels.x1).toBeDefined();
        expect(channels.x2).toBeDefined();

        const result = stackedData.map((d) => ({
            y: d[channels.y as string],
            x1: d[channels.x1 as string],
            x2: d[channels.x2 as string],
            fill: d[channels.fill as string]
        }));
        expect(result).toEqual([
            { y: 1, x1: 0, x2: 10, fill: 'A' },
            { y: 1, x1: 10, x2: 30, fill: 'B' },
            { y: 2, x1: 0, x2: 30, fill: 'A' },
            { y: 2, x1: 30, x2: 70, fill: 'B' }
        ]);
    });

    it('stacks recordized array', () => {
        const data = [10, 20, 30, undefined, 40] as DataRow[];
        const { data: stackedData, ...channels } = stackX(recordizeX({ data, x1: 0, x2: 0 }));
        const { y, x1, x2 } = channels;
        const result = stackedData.map((d) => ({
            y: d[y as string],
            x1: d[x1 as string],
            x2: d[x2 as string]
        }));
        expect(result).toEqual([
            { y: 0, x1: 0, x2: 10 },
            { y: 1, x1: 0, x2: 20 },
            { y: 2, x1: 0, x2: 30 },
            { y: 3, x1: 0, x2: NaN },
            { y: 4, x1: 0, x2: 40 }
        ]);
    });
});

const sales: DataRecord[] = [
    { id: 'p/A', product: 'phone', company: 'A', sales: 10 },
    { id: 'p/B', product: 'phone', company: 'B', sales: 20 },
    { id: 'l/A', product: 'laptop', company: 'A', sales: 40 },
    { id: 'l/B', product: 'laptop', company: 'B', sales: 50 }
];

describe('stackMosaicX', () => {
    const simplify = (d: DataRecord, channels: Record<string, any>): DataRecord => {
        const {
            [channels.x]: xv,
            [channels.x1]: x1v,
            [channels.x2]: x2v,
            [channels.y]: yv,
            [channels.y1]: y1v,
            [channels.y2]: y2v
        } = d;
        return {
            ...d,
            x: [x1v, xv, x2v],
            y: [y1v, yv, y2v]
        };
    };

    it('mosaic stacking', () => {
        const { data, ...channels } = stackMosaicX({
            data: sales,
            x: 'product',
            y: 'sales',
            value: 'sales'
        });

        expect(channels).toBeDefined();
        expect(data).toHaveLength(sales.length);
        expect(channels.x).toBeDefined();
        expect(channels.y).toBeDefined();

        const res = data.map((d) => simplify(d, channels));
        // phone/A (10)  |  laptop/A (40)
        // phone/B (20)  |  laptop/B (50)
        // ------------------------------
        // total: 30     |  total: 90
        expect(res.map((d) => d.id)).toStrictEqual(['p/A', 'p/B', 'l/A', 'l/B']);
        expect(res[0].x).toStrictEqual([0, 15, 30]);
        expect(res[0].y).toStrictEqual([0, 5, 10]);
        expect(res[1].x).toStrictEqual([0, 15, 30]);
        expect(res[1].y).toStrictEqual([10, 20, 30]);
        expect(res[2].x).toStrictEqual([30, 75, 120]);
        expect(res[2].y).toStrictEqual([0, 20, 40]);
        expect(res[3].x).toStrictEqual([30, 75, 120]);
        expect(res[3].y).toStrictEqual([40, 65, 90]);
    });

    it('mosaic stacking x percent', () => {
        const { data, ...channels } = stackMosaicX(
            {
                data: sales,
                x: 'product',
                y: 'sales',
                value: 'sales'
            },
            { x: { percent: true } }
        );

        const res = data.map((d) => simplify(d, channels));
        // phone/A (10)  |  laptop/A (40)
        // phone/B (20)  |  laptop/B (50)
        // ------------------------------
        // total: 25%     |  total: 75%
        expect(res.map((d) => d.id)).toStrictEqual(['p/A', 'p/B', 'l/A', 'l/B']);
        expect(res[0].x).toStrictEqual([0, 0.125, 0.25]);
        expect(res[0].y).toStrictEqual([0, 5, 10]);
        expect(res[1].x).toStrictEqual([0, 0.125, 0.25]);
        expect(res[1].y).toStrictEqual([10, 20, 30]);
        expect(res[2].x).toStrictEqual([0.25, 0.625, 1]);
        expect(res[2].y).toStrictEqual([0, 20, 40]);
        expect(res[3].x).toStrictEqual([0.25, 0.625, 1]);
        expect(res[3].y).toStrictEqual([40, 65, 90]);
    });

    it('mosaic stacking y percent', () => {
        const { data, ...channels } = stackMosaicX(
            {
                data: sales,
                x: 'product',
                y: 'sales',
                value: 'sales'
            },
            { y: { percent: true } }
        );

        const res = data.map((d) => simplify(d, channels));
        // phone/A (10)  |  laptop/A (40)
        // phone/B (20)  |  laptop/B (50)
        // ------------------------------
        // total: 30     |  total: 90
        expect(res.map((d) => d.id)).toStrictEqual(['p/A', 'p/B', 'l/A', 'l/B']);
        expect(res[0].x).toStrictEqual([0, 15, 30]);
        expect(res[0].y).toStrictEqual([0, 1 / 6, 1 / 3]);
        expect(res[1].x).toStrictEqual([0, 15, 30]);
        expect(res[1].y).toStrictEqual([1 / 3, 2 / 3, 1]);
        expect(res[2].x).toStrictEqual([30, 75, 120]);
        expect(res[2].y).toStrictEqual([0, 2 / 9, 4 / 9]);
        expect(res[3].x).toStrictEqual([30, 75, 120]);
        expect(res[3].y).toStrictEqual([4 / 9, 6.5 / 9, 1]);
    });

    it('mosaic faceted along x', () => {
        const { data, ...channels } = stackMosaicX({
            data: sales,
            x: 'product',
            y: 'company',
            fx: 'company',
            value: 'sales'
        });

        // phone/A (10)  |  laptop/A (40)  ||  phone/B (20)  |  laptop/B (50)
        const res = data.map((d) => simplify(d, channels));
        expect(res[0].x).toStrictEqual([0, 5, 10]);
        expect(res[0].y).toStrictEqual([0, 5, 10]);
        expect(res[1].x).toStrictEqual([10, 30, 50]);
        expect(res[1].y).toStrictEqual([0, 20, 40]);
        expect(res[2].x).toStrictEqual([0, 10, 20]);
        expect(res[2].y).toStrictEqual([0, 10, 20]);
        expect(res[3].x).toStrictEqual([20, 45, 70]);
        expect(res[3].y).toStrictEqual([0, 25, 50]);
    });

    it('mosaic faceted along y', () => {
        const { data, ...channels } = stackMosaicX({
            data: sales,
            x: 'product',
            y: 'company',
            fy: 'company',
            value: 'sales'
        });

        // phone/A (10)  |  laptop/A (40)
        // ------------------------------
        // phone/B (20)  |  laptop/B (50)
        const res = data.map((d) => simplify(d, channels));
        expect(res.map((d) => d.id)).toStrictEqual(['p/A', 'l/A', 'p/B', 'l/B']);
        expect(res[0].x).toStrictEqual([0, 5, 10]);
        expect(res[0].y).toStrictEqual([0, 5, 10]);
        expect(res[1].x).toStrictEqual([10, 30, 50]);
        expect(res[1].y).toStrictEqual([0, 20, 40]);
        expect(res[2].x).toStrictEqual([0, 10, 20]);
        expect(res[2].y).toStrictEqual([0, 10, 20]);
        expect(res[3].x).toStrictEqual([20, 45, 70]);
        expect(res[3].y).toStrictEqual([0, 25, 50]);
    });

    it('mosaic + filter', () => {
        const { data, ...channels } = stackMosaicX({
            data: sales,
            x: 'product',
            y: 'sales',
            value: 'sales',
            filter: (d: DataRecord) => d.id !== 'l/A'
        });

        expect(channels).toBeDefined();
        expect(data).toHaveLength(sales.length - 1);
        expect(channels.x).toBeDefined();
        expect(channels.y).toBeDefined();

        const res = data.map((d) => simplify(d, channels));
        // phone/A (10)  |
        // phone/B (20)  |  laptop/B (50)
        // ------------------------------
        // total: 30     |  total: 50
        expect(res.map((d) => d.id)).toStrictEqual(['p/A', 'p/B', 'l/B']);
        expect(res[0].x).toStrictEqual([0, 15, 30]);
        expect(res[0].y).toStrictEqual([0, 5, 10]);
        expect(res[1].x).toStrictEqual([0, 15, 30]);
        expect(res[1].y).toStrictEqual([10, 20, 30]);
        expect(res[2].x).toStrictEqual([30, 55, 80]);
        expect(res[2].y).toStrictEqual([0, 25, 50]);
    });

    it('mosaic sorting', () => {
        const { data, ...channels } = stackMosaicX({
            data: sales,
            x: 'product',
            y: 'sales',
            value: 'sales',
            sort: { channel: '-value' }
        });

        expect(channels).toBeDefined();
        expect(data).toHaveLength(sales.length);
        expect(channels.x).toBeDefined();
        expect(channels.y).toBeDefined();

        const res = data.map((d) => simplify(d, channels));

        // total: 30     |  total: 90

        // laptop/B (50) | phone/B (20)
        // laptop/A (40) | phone/B (10)
        // ------------------------------
        // total: 90     | total: 30
        expect(res.map((d) => d.id)).toStrictEqual(['l/B', 'l/A', 'p/B', 'p/A']);
        expect(res[0].x).toStrictEqual([0, 45, 90]);
        expect(res[0].y).toStrictEqual([0, 25, 50]);
        expect(res[1].x).toStrictEqual([0, 45, 90]);
        expect(res[1].y).toStrictEqual([50, 70, 90]);
        expect(res[2].x).toStrictEqual([90, 105, 120]);
        expect(res[2].y).toStrictEqual([0, 10, 20]);
        expect(res[3].x).toStrictEqual([90, 105, 120]);
        expect(res[3].y).toStrictEqual([20, 25, 30]);
    });

    it('mosaic with negative values throws error', () => {
        expect(() =>
            stackMosaicX({
                data: sales.map((d) => ({ ...d, sales: d.id === 'p/A' ? -10 : d.sales })),
                x: 'product',
                y: 'sales',
                value: 'sales'
            })
        ).toThrowError('stackMosaic: negative values not supported');
    });
});

describe('stackMosaicY', () => {
    const simplify = (d: DataRecord, channels: Record<string, any>): DataRecord => {
        const {
            [channels.x]: xv,
            [channels.x1]: x1v,
            [channels.x2]: x2v,
            [channels.y]: yv,
            [channels.y1]: y1v,
            [channels.y2]: y2v
        } = d;
        return {
            ...d,
            x: [x1v, xv, x2v],
            y: [y1v, yv, y2v]
        };
    };
    it('mosaic stacking', () => {
        const { data, ...channels } = stackMosaicY({
            data: sales,
            x: 'sales',
            y: 'product',
            value: 'sales'
        });

        expect(channels).toBeDefined();
        expect(data).toHaveLength(sales.length);
        expect(channels.x).toBeDefined();
        expect(channels.y).toBeDefined();

        const res = data.map((d) => simplify(d, channels));
        // phone/A (10)  |  laptop/A (40)
        // phone/B (20)  |  laptop/B (50)
        // ------------------------------
        // total: 30     |  total: 90
        expect(res.map((d) => d.id)).toStrictEqual(['p/A', 'p/B', 'l/A', 'l/B']);
        expect(res[0].x).toStrictEqual([0, 5, 10]);
        expect(res[0].y).toStrictEqual([0, 15, 30]);
        expect(res[1].x).toStrictEqual([10, 20, 30]);
        expect(res[1].y).toStrictEqual([0, 15, 30]);
        expect(res[2].x).toStrictEqual([0, 20, 40]);
        expect(res[2].y).toStrictEqual([30, 75, 120]);
        expect(res[3].x).toStrictEqual([40, 65, 90]);
        expect(res[3].y).toStrictEqual([30, 75, 120]);
    });
});
