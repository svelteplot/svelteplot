import { describe, it, vi, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import BarXTest from './barX.test.svelte';
import { getPathDims, getRectDims } from './utils';
import { tick } from 'svelte';
import { INDEX } from 'svelteplot/constants';
import { max } from 'd3-array';

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

const linkedBarsData = [
    { url: '/marks/line', label: 'Line', value: 5 },
    { url: '/marks/bar', label: 'Bar', value: 3 },
    { url: '/marks/dot', label: 'Dot', value: 4 },
    { url: '/marks/dot', label: 'Rect', value: 2 }
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

    it('emits correct events after updating data', async () => {
        const checkDatum = vi.fn();

        const props = $state({
            plotArgs: {},
            barArgs: {
                data: [1, 2, 3, 4, 5],
                onclick: (evt: MouseEvent, datum: any) => checkDatum(datum)
            }
        });

        const { container } = render(BarXTest, { props });
        const bars = container.querySelectorAll('g.bar-x > rect') as NodeListOf<SVGRectElement>;
        expect(bars.length).toBe(5);

        await fireEvent.click(bars[2]);
        expect(checkDatum).toHaveBeenCalledTimes(1);
        expect(checkDatum).toHaveBeenCalledWith(3);

        props.barArgs.data = [10, 20, 30, 40, 50];
        await tick();

        await fireEvent.click(bars[2]);

        expect(checkDatum).toHaveBeenCalledTimes(2);
        expect(checkDatum).toHaveBeenCalledWith(30);
    });

    it('accessor functions receive index', () => {
        const xIndex = vi.fn();
        const fillIndex = vi.fn();
        const dxIndex = vi.fn();
        render(BarXTest, {
            props: {
                plotArgs: {},
                barArgs: {
                    data: timeseries,
                    x: (d, index) => {
                        xIndex(index);
                        return d.value;
                    },
                    fill: (d, index) => {
                        fillIndex(index);
                        return 'steelblue';
                    },
                    dx: (x, index) => {
                        dxIndex(index);
                        return 0;
                    },
                    y: 'year'
                }
            }
        });
        expect(xIndex).toHaveBeenCalled();
        expect(xIndex.mock.calls[0]).toStrictEqual([0]);
        expect(xIndex.mock.calls[1]).toStrictEqual([1]);
        expect(xIndex.mock.calls[2]).toStrictEqual([2]);
        expect(fillIndex.mock.calls[2]).toStrictEqual([2]);
        expect(dxIndex.mock.calls[1]).toStrictEqual([1]);
        expect(dxIndex.mock.calls[3]).toStrictEqual([3]);
    });

    it('bars with hyperlinks', () => {
        const { container } = render(BarXTest, {
            props: {
                plotArgs: {
                    width: 100
                },
                barArgs: {
                    data: linkedBarsData,
                    x: 'value',
                    y: 'label',
                    href: 'url'
                }
            }
        });
        const links = container.querySelectorAll('g.bar-x > a') as NodeListOf<SVGAElement>;
        const bars = container.querySelectorAll('g.bar-x > a > rect') as NodeListOf<SVGRectElement>;
        const sortedByLabels = linkedBarsData
            .toSorted((a, b) => (a.label > b.label ? 1 : a.label < b.label ? -1 : 0))
            .map((d) => d.value);

        const maxValue = Math.max(...sortedByLabels);
        expect(bars.length).toBe(linkedBarsData.length);

        const barDims = Array.from(bars).map(getRectDims);
        const maxBarWidth = Math.max(...barDims.map((d) => d.w));

        // check that bars are sorted by label
        expect(barDims.map((d) => d.w)).toStrictEqual(
            sortedByLabels.map((m) => (m / maxValue) * maxBarWidth)
        );
        // check that links have correct href
        expect(Array.from(links).map((d) => d.getAttribute('href'))).toStrictEqual(
            linkedBarsData.toSorted((a, b) => a.label.localeCompare(b.label)).map((d) => d.url)
        );
    });
});
