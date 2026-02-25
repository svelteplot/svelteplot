import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import BarYTest from './barY.test.svelte';
import { groupBy } from 'es-toolkit';
import { parseSVG, makeAbsolute } from 'svg-path-parser';

describe('BarY mark', () => {
    it('simple bar chart from number array', () => {
        const { container } = render(BarYTest, {
            props: {
                plotArgs: {},
                barArgs: {
                    data: [1, 2, 3, 4, 5],
                    strokeWidth: (d: any) => d
                }
            }
        });

        const bars = container.querySelectorAll('g.bar-y > rect') as NodeListOf<SVGRectElement>;
        expect(bars.length).toBe(5);
        const barDims = Array.from(bars).map(getRectDims);
        // check that bar widths are equal
        expect(barDims[1].w).toBe(barDims[0].w);
        expect(barDims[2].w).toBe(barDims[0].w);
        expect(barDims[3].w).toBe(barDims[0].w);
        expect(barDims[1].h).toBe(barDims[0].h * 2);
        expect(barDims[2].h).toBe(barDims[0].h * 3);
        expect(barDims[3].h).toBe(barDims[0].h * 4);
        expect(barDims[4].h).toBe(barDims[0].h * 5);
        expect(barDims.map((d) => d.strokeWidth)).toStrictEqual([
            '1px',
            '2px',
            '3px',
            '4px',
            '5px'
        ]);
    });

    it('bars are filled by default', () => {
        const { container } = render(BarYTest, {
            props: {
                plotArgs: {},
                barArgs: {
                    data: [1, 2, 4]
                }
            }
        });

        const bars = container.querySelectorAll('g.bar-y > rect') as NodeListOf<SVGRectElement>;
        expect(bars.length).toBe(3);
        expect(bars[0].style.fill).toBe('currentColor');
        expect(bars[0].style.stroke).toBe('none');
    });

    it('bars have stroke only if just stroke channel is set', () => {
        const { container } = render(BarYTest, {
            props: {
                plotArgs: {},
                barArgs: {
                    data: [1, 2, 4],
                    stroke: 'currentColor'
                }
            }
        });

        const bars = container.querySelectorAll('g.bar-y > rect') as NodeListOf<SVGRectElement>;
        expect(bars.length).toBe(3);
        expect(bars[0].style.fill).toBe('none');
        expect(bars[0].style.stroke).toBe('currentColor');
    });

    it('stacked bar chart', () => {
        // Mock data similar to bundlesizes in the example
        const data = [
            // normal scenario
            { scenario: 'normal', package: 'svelte', size: 10 },
            { scenario: 'normal', package: 'plot', size: 15 },
            { scenario: 'normal', package: 'd3', size: 30 },
            // core scenario
            { scenario: 'core', package: 'svelte', size: 8 },
            { scenario: 'core', package: 'plot', size: 10 },
            { scenario: 'core', package: 'd3', size: 20 },
            // d3 scenario
            { scenario: 'd3', package: 'svelte', size: 6 },
            { scenario: 'd3', package: 'd3', size: 10 }
        ];

        const { container } = render(BarYTest, {
            props: {
                plotArgs: {
                    x: { domain: ['normal', 'core', 'd3'] }
                },
                barArgs: {
                    data,
                    y: 'size',
                    x: 'scenario',
                    fill: 'package',
                    insetTop: 1
                }
            }
        });

        // Check that stacked bars are rendered
        const bars = container.querySelectorAll('g.bar-y > rect') as NodeListOf<SVGRectElement>;

        // There should be 9 bars in total (3 packages × 3 scenarios)
        expect(bars.length).toBe(8);

        const barDims = Array.from(bars).map(getRectDims);

        // group bars by x
        const groups = Object.values(groupBy(barDims, (d) => d.x)).map((bars) =>
            bars.sort((a, b) => b.y - a.y)
        );
        expect(groups[0]).toHaveLength(3);
        expect(groups[1]).toHaveLength(3);
        expect(groups[2]).toHaveLength(2);

        // expect(groups[1][0].h).toBe(groups[0][0].h * 2);
        // expect(groups[2][0].h).toBe(groups[0][0].h * 3);
    });

    it('simple bar chart with rounded corners', () => {
        const { container } = render(BarYTest, {
            props: {
                plotArgs: {},
                barArgs: {
                    data: [1, 2, 3, 4, 5],
                    borderRadius: 4
                }
            }
        });

        const bars = container.querySelectorAll('g.bar-y > path') as NodeListOf<SVGPathElement>;
        expect(bars.length).toBe(5);
        const barDims = Array.from(bars).map(getPathDims);
        // check that bar widths are equal
        expect(barDims[1].w).toBe(barDims[0].w);
        expect(barDims[2].w).toBe(barDims[0].w);
        expect(barDims[3].w).toBe(barDims[0].w);
        expect(barDims[1].h).toBe(barDims[0].h * 2);
        expect(barDims[2].h).toBe(barDims[0].h * 3);
        expect(barDims[3].h).toBe(barDims[0].h * 4);
        expect(barDims[4].h).toBe(barDims[0].h * 5);
    });

    const timeseries = [
        { year: 2019, value: 1 },
        { year: 2020, value: 2 },
        { year: 2021, value: 3 },
        { year: 2022, value: 4 },
        { year: 2024, value: 5 }
    ];

    it('skips missing years in band scale domain', () => {
        const { container } = render(BarYTest, {
            props: {
                plotArgs: {
                    width: 400,
                    height: 400,
                    axes: true
                },
                barArgs: {
                    data: timeseries,
                    y: 'value',
                    x: 'year'
                }
            }
        });

        const bars = container.querySelectorAll('g.bar-y > rect') as NodeListOf<SVGRectElement>;
        expect(bars.length).toBe(5);

        const xAxisLabels = container.querySelectorAll(
            'g.axis-x .tick text'
        ) as NodeListOf<SVGGElement>;
        expect(xAxisLabels.length).toBe(5);
        const labels = Array.from(xAxisLabels).map((d) => d.textContent);
        expect(labels.sort()).toStrictEqual(['2019', '2020', '2021', '2022', '2024']);
    });

    it('includes missing years in band scale domain if interval is set', () => {
        const { container } = render(BarYTest, {
            props: {
                plotArgs: {
                    width: 500,
                    height: 400,
                    axes: true,
                    x: { interval: 1 }
                },
                barArgs: {
                    data: timeseries,
                    y: 'value',
                    x: 'year'
                }
            }
        });

        const bars = container.querySelectorAll('g.bar-y > rect') as NodeListOf<SVGRectElement>;
        expect(bars.length).toBe(5);

        const xAxisLabels = container.querySelectorAll(
            'g.axis-x .tick text'
        ) as NodeListOf<SVGGElement>;
        expect(xAxisLabels.length).toBe(6);
        const labels = Array.from(xAxisLabels).map((d) => d.textContent);
        expect(labels.sort()).toEqual(['2019', '2020', '2021', '2022', '2023', '2024']);
    });

    const categoricalData = [
        { label: 'delta', value: 1 },
        { label: 'alpha', value: 2 },
        { label: 'charlie', value: 4 },
        { label: 'bravo', value: 3 }
    ];

    const facetedBarsData = [
        { party: 'Union', year: 2025, percent: 30 },
        { party: 'Union', year: 2021, percent: 22 },
        { party: 'SPD', year: 2025, percent: 20 },
        { party: 'SPD', year: 2021, percent: 27 },
        { party: 'Greens', year: 2025, percent: 16 },
        { party: 'Greens', year: 2021, percent: 21 },
        { party: 'FDP', year: 2025, percent: 6 },
        { party: 'FDP', year: 2021, percent: 12 },
        { party: 'Linke', year: 2025, percent: 4 },
        { party: 'Linke', year: 2021, percent: 7 }
    ];

    it('repeats axis-x for all facets and shows facet-axis-x labels', () => {
        const { container } = render(BarYTest, {
            props: {
                plotArgs: {
                    width: 700,
                    height: 300,
                    axes: true,
                    fx: {
                        axis: 'bottom',
                        axisProps: {
                            tickFontSize: 12
                        },
                        axisOptions: {
                            dy: 20,
                            fontWeight: 'bold'
                        }
                    }
                },
                barArgs: {
                    data: facetedBarsData,
                    x: 'year',
                    y: 'percent',
                    fx: 'party',
                    fill: 'party',
                    opacity: 'year'
                }
            }
        });

        const facetCount = new Set(facetedBarsData.map((d) => d.party)).size;

        expect(container.querySelectorAll('g.axis-y')).toHaveLength(1);
        expect(container.querySelectorAll('g.axis-x')).toHaveLength(facetCount);
        expect(container.querySelectorAll('g.facet g.axis-x')).toHaveLength(facetCount);
        expect(container.querySelectorAll('g.facet-axis-x')).toHaveLength(1);

        const facetAxisLabels = Array.from(
            container.querySelectorAll('g.facet-axis-x .tick text')
        ).map((tick) => tick.textContent);
        expect(new Set(facetAxisLabels)).toEqual(
            new Set(['Union', 'SPD', 'Greens', 'FDP', 'Linke'])
        );
        expect(facetAxisLabels.every((label) => (label || '').trim().length > 0)).toBe(true);
    });

    it('sorts ordinal domain alphabetically by default', () => {
        const { container } = render(BarYTest, {
            props: {
                plotArgs: {
                    width: 100,
                    axes: true
                },
                barArgs: {
                    data: categoricalData,
                    x: 'label',
                    y: 'value'
                }
            }
        });
        const ticks = Array.from(container.querySelectorAll('svg g.axis-x .tick text'));
        expect(ticks.length).toBe(4);
        const tickTexts = ticks.map((t) => t.textContent);
        expect(tickTexts).toEqual(['alpha', 'bravo', 'charlie', 'delta']);
    });

    it('does not sort ordinal domain alphabetically if mark is sorted', () => {
        const { container } = render(BarYTest, {
            props: {
                plotArgs: {
                    width: 100,
                    axes: true
                },
                barArgs: {
                    data: categoricalData,
                    x: 'label',
                    y: 'value',
                    sort: 'value'
                }
            }
        });
        const ticks = Array.from(container.querySelectorAll('svg g.axis-x .tick text'));
        expect(ticks.length).toBe(4);
        const tickTexts = ticks.map((t) => t.textContent);
        expect(tickTexts).toEqual(['delta', 'alpha', 'bravo', 'charlie']);
    });

    it('ordinal sorted can be disabled via scale option', () => {
        const { container } = render(BarYTest, {
            props: {
                plotArgs: {
                    width: 100,
                    axes: true,
                    x: { sort: false }
                },
                barArgs: {
                    data: categoricalData,
                    x: 'label',
                    y: 'value'
                }
            }
        });
        const ticks = Array.from(container.querySelectorAll('svg g.axis-x .tick'));
        expect(ticks.length).toBe(4);
        const tickTexts = ticks.map((t) => t.textContent);
        expect(tickTexts).toEqual(['delta', 'alpha', 'charlie', 'bravo']);
    });

    it('ordinal sorted can be disabled via plot option', () => {
        const { container } = render(BarYTest, {
            props: {
                plotArgs: {
                    width: 100,
                    axes: true,
                    sortOrdinalDomains: false
                },
                barArgs: {
                    data: categoricalData,
                    x: 'label',
                    y: 'value'
                }
            }
        });
        const ticks = Array.from(container.querySelectorAll('svg g.axis-x .tick'));
        expect(ticks.length).toBe(4);
        const tickTexts = ticks.map((t) => t.textContent);
        expect(tickTexts).toEqual(['delta', 'alpha', 'charlie', 'bravo']);
    });

    it('ordinal sorted can be disabled via plot option even with fill set', () => {
        const { container } = render(BarYTest, {
            props: {
                plotArgs: {
                    width: 100,
                    axes: true,
                    sortOrdinalDomains: false
                },
                barArgs: {
                    data: categoricalData,
                    x: 'label',
                    y: 'value',
                    stack: false,
                    fill: (d: any) => (d?.label === 'alpha' ? 'red' : 'blue')
                }
            }
        });
        const ticks = Array.from(container.querySelectorAll('svg g.axis-x .tick'));
        expect(ticks.length).toBe(4);
        const tickTexts = ticks.map((t) => t.textContent);
        expect(tickTexts).toEqual(['delta', 'alpha', 'charlie', 'bravo']);
    });
});

function getRectDims(rect: SVGRectElement) {
    const t = rect
        ?.getAttribute('transform')
        ?.match(/translate\((\d+(?:\.\d+)?),(\d+(?:\.\d+)?)\)/);
    return {
        x: Math.round(+t![1]),
        y: Math.round(+t![2]),
        w: Math.round(+rect.getAttribute('width')!),
        h: Math.round(+rect.getAttribute('height')!),
        fill: rect.style.fill,
        stroke: rect.style.stroke,
        strokeWidth: rect.style.strokeWidth
    };
}

function getPathDims(path: SVGPathElement) {
    const r = makeAbsolute(parseSVG(path.getAttribute('d')!));
    const x = r.flatMap((d: any) => [d.x, d.x0, d.x1]).filter((x: number | undefined) => x != null);
    const y = r.flatMap((d: any) => [d.y, d.y0, d.y1]).filter((y: number | undefined) => y != null);
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
