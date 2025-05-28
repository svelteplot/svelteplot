import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import BarXTest from './barX.test.svelte';
import { parseSVG, makeAbsolute } from 'svg-path-parser';

const testData = [
    {
        year: '2010',
        low: 2,
        high: 5
    },
    {
        year: '2011',
        low: 4,
        high: 7
    }
];

describe('BarX mark', () => {
    it('simple bar chart from number array', () => {
        const { container } = render(BarXTest, {
            props: {
                plotArgs: {},
                barArgs: {
                    data: [1, 2, 3, 4, 5],
                    strokeWidth: (d: any) => d
                }
            }
        });

        const bars = container.querySelectorAll('g.bar-x > rect') as NodeListOf<SVGRectElement>;
        expect(bars.length).toBe(5);
        const barDims = Array.from(bars).map(getRectDims);
        // check that bar height are equal
        expect(barDims.map((d) => d.h)).toStrictEqual(new Array(5).fill(barDims[0].h));
        // check that bar length match data
        expect(barDims.map((d) => d.w)).toStrictEqual([1, 2, 3, 4, 5].map((m) => barDims[0].w * m));
        expect(barDims.map((d) => d.strokeWidth)).toStrictEqual([
            '1px',
            '2px',
            '3px',
            '4px',
            '5px'
        ]);
    });

    it('bar chart from objects', () => {
        const { container } = render(BarXTest, {
            props: {
                plotArgs: {},
                barArgs: {
                    data: testData,
                    y: 'year',
                    fill: 'year',
                    x1: 'low',
                    x2: 'high'
                }
            }
        });

        const bars = container.querySelectorAll('g.bar-x > rect') as NodeListOf<SVGRectElement>;
        expect(bars.length).toBe(2);
        const barDims = Array.from(bars).map(getRectDims);
        expect(barDims[0].w).toBe(barDims[1].w);
        expect(barDims[0].x).not.toBe(barDims[1].x);
    });

    it('uses path for rounded rects', () => {
        const { container } = render(BarXTest, {
            props: {
                plotArgs: {},
                barArgs: {
                    data: [1, 2, 3, 4, 5],
                    borderRadius: { topLeft: 2 }
                }
            }
        });

        const bars = container.querySelectorAll('g.bar-x > path') as NodeListOf<SVGPathElement>;
        expect(bars.length).toBe(5);
        const barDims = Array.from(bars).map(getPathDims);
        // // check that bar height are equal
        expect(barDims.map((d) => d.h)).toStrictEqual(new Array(5).fill(barDims[0].h));
        // // check that bar length match data
        expect(barDims.map((d) => d.w)).toStrictEqual([1, 2, 3, 4, 5].map((m) => barDims[0].w * m));
    });

    const timeseries = [
        { year: 2019, value: 1 },
        { year: 2020, value: 2 },
        { year: 2021, value: 3 },
        { year: 2022, value: 4 },
        { year: 2024, value: 5 }
    ];

    it('skips missing years in band scale domain', () => {
        const { container } = render(BarXTest, {
            props: {
                plotArgs: {
                    height: 200,
                    axes: true
                },
                barArgs: {
                    data: timeseries,
                    x: 'value',
                    y: 'year'
                }
            }
        });

        const bars = container.querySelectorAll('g.bar-x > rect') as NodeListOf<SVGRectElement>;
        expect(bars.length).toBe(5);

        const yAxisLabels = container.querySelectorAll(
            'g.axis-y .tick text'
        ) as NodeListOf<SVGGElement>;
        expect(yAxisLabels.length).toBe(5);
        const labels = Array.from(yAxisLabels).map((d) => d.textContent);
        expect(labels.sort()).toStrictEqual(['2019', '2020', '2021', '2022', '2024']);
    });

    it('includes missing years in band scale domain if interval is set', () => {
        const { container } = render(BarXTest, {
            props: {
                plotArgs: {
                    height: 200,
                    axes: true,
                    y: { interval: 1 }
                },
                barArgs: {
                    data: timeseries,
                    x: 'value',
                    y: 'year'
                }
            }
        });

        const bars = container.querySelectorAll('g.bar-x > rect') as NodeListOf<SVGRectElement>;
        expect(bars.length).toBe(5);

        const yAxisLabels = container.querySelectorAll(
            'g.axis-y .tick text'
        ) as NodeListOf<SVGGElement>;
        expect(yAxisLabels.length).toBe(6);
        const labels = Array.from(yAxisLabels).map((d) => d.textContent);
        expect(labels.sort()).toEqual(['2019', '2020', '2021', '2022', '2023', '2024']);
    });
});

function getRectDims(rect: SVGRectElement) {
    const t = rect
        ?.getAttribute('transform')
        ?.match(/translate\((\d+(?:\.\d+)?),(\d+(?:\.\d+)?)\)/);
    return {
        x: Math.round(+t[1]),
        y: Math.round(+t[2]),
        w: Math.round(+rect.getAttribute('width')),
        h: Math.round(+rect.getAttribute('height')),
        fill: rect.style.fill,
        stroke: rect.style.stroke,
        strokeWidth: rect.style.strokeWidth
    };
}

function getPathDims(path: SVGPathElement) {
    const r = makeAbsolute(parseSVG(path.getAttribute('d')));
    const x = r.flatMap((d) => [d.x, d.x0, d.x1]).filter((x) => x != null);
    const y = r.flatMap((d) => [d.y, d.y0, d.y1]).filter((y) => y != null);
    const t = path
        ?.getAttribute('transform')
        ?.match(/translate\((\d+(?:\.\d+)?),(\d+(?:\.\d+)?)\)/);
    if (!r || !t) return { x: NaN, y: NaN, w: NaN, h: NaN };
    return {
        x: Math.round(Math.min(...x)),
        y: Math.round(Math.min(...y)),
        w: Math.round(Math.max(...x) - Math.min(...x)),
        h: Math.round(Math.max(...y) - Math.min(...y)),
        fill: path.style.fill,
        stroke: path.style.stroke,
        strokeWidth: path.style.strokeWidth
    };
}
