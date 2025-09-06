import { describe, it, expect } from 'vitest';
import { stackMarimekko } from './stack.js';
import type { DataRecord } from '$lib/types/index.js';

const sales: DataRecord[] = [
    { id: 'p/A', product: 'phone', company: 'A', sales: 10 },
    { id: 'p/B', product: 'phone', company: 'B', sales: 20 },
    { id: 'l/A', product: 'laptop', company: 'A', sales: 40 },
    { id: 'l/B', product: 'laptop', company: 'B', sales: 50 }
];

describe('stack marimekko', () => {
    const simplify = (d: DataRecord, channels) => {
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

    it('marimekko stacking', () => {
        const { data, ...channels } = stackMarimekko({
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
        expect(res[0].id).toBe('p/A');
        expect(res[0].x).toStrictEqual([0, 15, 30]);
        expect(res[0].y).toStrictEqual([0, 5, 10]);
        expect(res[1].id).toBe('p/B');
        expect(res[1].x).toStrictEqual([0, 15, 30]);
        expect(res[1].y).toStrictEqual([10, 20, 30]);
        expect(res[2].id).toBe('l/A');
        expect(res[2].x).toStrictEqual([30, 75, 120]);
        expect(res[2].y).toStrictEqual([0, 20, 40]);
        expect(res[3].id).toBe('l/B');
        expect(res[3].x).toStrictEqual([30, 75, 120]);
        expect(res[3].y).toStrictEqual([40, 65, 90]);
    });

    it('marimekko stacking x percent', () => {
        const { data, ...channels } = stackMarimekko(
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
        expect(res[0].id).toBe('p/A');
        expect(res[0].x).toStrictEqual([0, 0.125, 0.25]);
        expect(res[0].y).toStrictEqual([0, 5, 10]);
        expect(res[1].id).toBe('p/B');
        expect(res[1].x).toStrictEqual([0, 0.125, 0.25]);
        expect(res[1].y).toStrictEqual([10, 20, 30]);
        expect(res[2].id).toBe('l/A');
        expect(res[2].x).toStrictEqual([0.25, 0.625, 1]);
        expect(res[2].y).toStrictEqual([0, 20, 40]);
        expect(res[3].id).toBe('l/B');
        expect(res[3].x).toStrictEqual([0.25, 0.625, 1]);
        expect(res[3].y).toStrictEqual([40, 65, 90]);
    });

    it('marimekko stacking y percent', () => {
        const { data, ...channels } = stackMarimekko(
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
        expect(res[0].id).toBe('p/A');
        expect(res[0].x).toStrictEqual([0, 15, 30]);
        expect(res[0].y).toStrictEqual([0, 1 / 6, 1 / 3]);
        expect(res[1].id).toBe('p/B');
        expect(res[1].x).toStrictEqual([0, 15, 30]);
        expect(res[1].y).toStrictEqual([1 / 3, 2 / 3, 1]);
        expect(res[2].id).toBe('l/A');
        expect(res[2].x).toStrictEqual([30, 75, 120]);
        expect(res[2].y).toStrictEqual([0, 2 / 9, 4 / 9]);
        expect(res[3].id).toBe('l/B');
        expect(res[3].x).toStrictEqual([30, 75, 120]);
        expect(res[3].y).toStrictEqual([4 / 9, 6.5 / 9, 1]);
    });

    it('marimekko faceted along x', () => {
        const { data, ...channels } = stackMarimekko({
            data: sales,
            x: 'product',
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

    it('marimekko faceted along y', () => {
        const { data, ...channels } = stackMarimekko({
            data: sales,
            x: 'product',
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

    it('marimekko + filter', () => {
        const { data, ...channels } = stackMarimekko({
            data: sales,
            x: 'product',
            y: 'sales',
            value: 'sales',
            filter: (d) => d.id !== 'l/A'
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
});
