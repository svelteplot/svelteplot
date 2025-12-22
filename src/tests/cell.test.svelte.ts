import { describe, it, vi, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import CellTest from './cell.test.svelte';
import { getRectDims, getPathDims } from './utils';
import { tick } from 'svelte';

const testData = [
    { x: 'A', y: '1', value: 10 },
    { x: 'B', y: '1', value: 20 },
    { x: 'A', y: '2', value: 30 },
    { x: 'B', y: '2', value: 40 }
];

describe('Cell mark', () => {
    it('renders cells from object data', () => {
        const { container } = render(CellTest, {
            props: {
                plotArgs: {},
                cellArgs: {
                    data: testData,
                    x: 'x',
                    y: 'y',
                    fill: 'value'
                }
            }
        });

        const cells = container.querySelectorAll('g.cell > rect') as NodeListOf<SVGRectElement>;
        expect(cells.length).toBe(4);
    });

    it('positions cells correctly in band scale', () => {
        const { container } = render(CellTest, {
            props: {
                plotArgs: { width: 200, height: 200 },
                cellArgs: {
                    data: testData,
                    x: 'x',
                    y: 'y',
                    fill: 'value'
                }
            }
        });

        const cells = container.querySelectorAll('g.cell > rect') as NodeListOf<SVGRectElement>;
        expect(cells.length).toBe(4);

        // All cells should have the same width and height (band scale)
        const cellDims = Array.from(cells).map(getRectDims);
        const widths = cellDims.map((d) => d.w);
        const heights = cellDims.map((d) => d.h);

        // Check that all cells have equal widths
        expect(widths[0]).toBe(widths[1]);
        expect(widths[0]).toBe(widths[2]);
        expect(widths[0]).toBe(widths[3]);

        // Check that all cells have equal heights
        expect(heights[0]).toBe(heights[1]);
        expect(heights[0]).toBe(heights[2]);
        expect(heights[0]).toBe(heights[3]);
    });

    it('applies fill colors based on channel', () => {
        const { container } = render(CellTest, {
            props: {
                plotArgs: {},
                cellArgs: {
                    data: testData,
                    x: 'x',
                    y: 'y',
                    fill: 'value'
                }
            }
        });

        const cells = container.querySelectorAll('g.cell > rect') as NodeListOf<SVGRectElement>;
        expect(cells.length).toBe(4);

        const cellDims = Array.from(cells).map(getRectDims);

        // Cells should have different fill colors based on different values
        const fills = cellDims.map((d) => d.fill);
        expect(fills.length).toBe(4);
        // At least some fills should be different (since values are different)
        const uniqueFills = new Set(fills);
        expect(uniqueFills.size).toBeGreaterThan(1);
    });

    it('supports custom inset', () => {
        const { container } = render(CellTest, {
            props: {
                plotArgs: {
                    width: 200,
                    height: 200,
                    margin: 0,
                    x: { padding: 0 },
                    y: { padding: 0 }
                },
                cellArgs: {
                    data: testData,
                    x: 'x',
                    y: 'y',
                    fill: 'value',
                    inset: 2
                }
            }
        });

        const cells = container.querySelectorAll('g.cell > rect') as NodeListOf<SVGRectElement>;
        expect(cells.length).toBe(4);

        const cellDims = Array.from(cells).map(getRectDims);
        // With 200x200 plot, margin: 0, 2x2 cells, padding: 0, and inset of 2
        // Each cell is (100 - 2*2) = 96x96
        expect(cellDims[0].w).toBe(96);
        expect(cellDims[0].h).toBe(96);
    });

    it('uses path for rounded rects', () => {
        const { container } = render(CellTest, {
            props: {
                plotArgs: {},
                cellArgs: {
                    data: testData,
                    x: 'x',
                    y: 'y',
                    fill: 'value',
                    borderRadius: { topLeft: 2 }
                }
            }
        });

        const cells = container.querySelectorAll('g.cell > path') as NodeListOf<SVGPathElement>;
        expect(cells.length).toBe(4);
        const cellDims = Array.from(cells).map(getPathDims);

        // All cells should have the same width and height
        const widths = cellDims.map((d) => d.w);
        const heights = cellDims.map((d) => d.h);

        expect(widths[0]).toBe(widths[1]);
        expect(heights[0]).toBe(heights[1]);
    });

    it('supports accessor functions', () => {
        const { container } = render(CellTest, {
            props: {
                plotArgs: {},
                cellArgs: {
                    data: testData,
                    x: 'x',
                    y: 'y',
                    fill: (d: any) => (d.value > 25 ? 'red' : 'blue')
                }
            }
        });

        const cells = container.querySelectorAll('g.cell > rect') as NodeListOf<SVGRectElement>;
        expect(cells.length).toBe(4);

        const cellDims = Array.from(cells).map(getRectDims);
        const fills = cellDims.map((d) => d.fill);

        // First two cells should be blue (10, 20), last two should be red (30, 40)
        expect(fills.filter((f) => f === 'blue').length).toBe(2);
        expect(fills.filter((f) => f === 'red').length).toBe(2);
    });

    it('supports hyperlinks with href prop', () => {
        const linkedData = [
            { x: 'A', y: '1', value: 10, url: '/page1' },
            { x: 'B', y: '1', value: 20, url: '/page2' }
        ];

        const { container } = render(CellTest, {
            props: {
                plotArgs: {},
                cellArgs: {
                    data: linkedData,
                    x: 'x',
                    y: 'y',
                    fill: 'value',
                    href: 'url'
                }
            }
        });

        const links = container.querySelectorAll('g.cell > a') as NodeListOf<SVGAElement>;
        expect(links.length).toBe(2);
        expect(links[0].getAttribute('href')).toBe('/page1');
        expect(links[1].getAttribute('href')).toBe('/page2');

        const cells = container.querySelectorAll('g.cell > a > rect') as NodeListOf<SVGRectElement>;
        expect(cells.length).toBe(2);
    });

    it('supports custom stroke and opacity', () => {
        const { container } = render(CellTest, {
            props: {
                plotArgs: {},
                cellArgs: {
                    data: testData,
                    x: 'x',
                    y: 'y',
                    fill: 'value',
                    stroke: 'black',
                    strokeWidth: 2,
                    opacity: 0.5
                }
            }
        });

        const cells = container.querySelectorAll('g.cell > rect') as NodeListOf<SVGRectElement>;
        expect(cells.length).toBe(4);

        const cellDims = Array.from(cells).map(getRectDims);
        // Check that stroke is applied
        expect(cellDims[0].stroke).toBe('black');
        expect(cellDims[0].strokeWidth).toBe('2px');
    });

    it('sorts cells when sort option is provided', () => {
        const unsortedData = [
            { x: 'C', y: '2', value: 10 },
            { x: 'A', y: '1', value: 20 },
            { x: 'B', y: '1', value: 30 }
        ];

        const { container } = render(CellTest, {
            props: {
                plotArgs: {},
                cellArgs: {
                    data: unsortedData,
                    x: 'x',
                    y: 'y',
                    fill: 'value',
                    sort: { channel: 'x' }
                }
            }
        });

        const cells = container.querySelectorAll('g.cell > rect') as NodeListOf<SVGRectElement>;
        expect(cells.length).toBe(3);
    });

    it('emits correct events after updating data', async () => {
        const checkDatum = vi.fn();

        const props = $state({
            plotArgs: {},
            cellArgs: {
                data: testData,
                x: 'x',
                y: 'y',
                fill: 'value',
                onclick: (evt: MouseEvent, datum: any) => checkDatum(datum)
            }
        });

        const { container } = render(CellTest, { props });
        const cells = container.querySelectorAll('g.cell > rect') as NodeListOf<SVGRectElement>;
        expect(cells.length).toBe(4);

        await fireEvent.click(cells[0]);
        expect(checkDatum).toHaveBeenCalledTimes(1);
        // Check object properties instead of exact equality (datum includes INDEX symbol)
        expect(checkDatum.mock.calls[0][0]).toMatchObject(testData[0]);

        const newData = [
            { x: 'A', y: '1', value: 100 },
            { x: 'B', y: '1', value: 200 }
        ];
        props.cellArgs.data = newData;
        await tick();

        await fireEvent.click(cells[0]);

        expect(checkDatum).toHaveBeenCalledTimes(2);
        // Check object properties instead of exact equality
        expect(checkDatum.mock.calls[1][0]).toMatchObject(newData[0]);
    });

    it('accessor functions receive index', () => {
        const xIndex = vi.fn();
        const fillIndex = vi.fn();
        render(CellTest, {
            props: {
                plotArgs: {},
                cellArgs: {
                    data: testData,
                    x: (d, index) => {
                        xIndex(index);
                        return d.x;
                    },
                    y: 'y',
                    fill: (d, index) => {
                        fillIndex(index);
                        return 'steelblue';
                    }
                }
            }
        });
        expect(xIndex).toHaveBeenCalled();
        expect(xIndex.mock.calls[0]).toStrictEqual([0]);
        expect(xIndex.mock.calls[1]).toStrictEqual([1]);
        expect(xIndex.mock.calls[2]).toStrictEqual([2]);
        expect(fillIndex.mock.calls[2]).toStrictEqual([2]);
    });
});
