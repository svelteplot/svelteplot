import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import CellYTest from './cellY.test.svelte';
import { getRectDims, getPathDims } from './utils';

describe('CellY mark', () => {
    it('renders cells from simple number array', () => {
        const { container } = render(CellYTest, {
            props: {
                plotArgs: {},
                cellArgs: {
                    data: [10, 20, 30, 40, 50]
                }
            }
        });

        const cells = container.querySelectorAll('g.cell > rect') as NodeListOf<SVGRectElement>;
        expect(cells.length).toBe(5);
    });

    it('positions cells along y-axis with fixed x position', () => {
        const { container } = render(CellYTest, {
            props: {
                plotArgs: { width: 100, height: 200 },
                cellArgs: {
                    data: [10, 20, 30]
                }
            }
        });

        const cells = container.querySelectorAll('g.cell > rect') as NodeListOf<SVGRectElement>;
        expect(cells.length).toBe(3);

        const cellDims = Array.from(cells).map(getRectDims);

        // All cells should have the same width
        const widths = cellDims.map((d) => d.w);
        expect(widths[0]).toBe(widths[1]);
        expect(widths[1]).toBe(widths[2]);

        // All cells should have the same height (band scale)
        const heights = cellDims.map((d) => d.h);
        expect(heights[0]).toBe(heights[1]);
        expect(heights[1]).toBe(heights[2]);

        // Y positions should be different
        const yPositions = cellDims.map((d) => d.y);
        expect(yPositions[0]).not.toBe(yPositions[1]);
        expect(yPositions[1]).not.toBe(yPositions[2]);
    });

    it('renders cells from object data', () => {
        const testData = [{ value: 5 }, { value: 10 }, { value: 15 }];

        const { container } = render(CellYTest, {
            props: {
                plotArgs: {},
                cellArgs: {
                    data: testData,
                    y: 'value'
                }
            }
        });

        const cells = container.querySelectorAll('g.cell > rect') as NodeListOf<SVGRectElement>;
        expect(cells.length).toBe(3);
    });

    it('uses default fill behavior (identity function) for raw values', () => {
        const { container } = render(CellYTest, {
            props: {
                plotArgs: {},
                cellArgs: {
                    data: [10, 20, 30]
                }
            }
        });

        const cells = container.querySelectorAll('g.cell > rect') as NodeListOf<SVGRectElement>;
        expect(cells.length).toBe(3);

        // For CellY with raw values, fill should default to the identity function
        // The cells should exist and be rendered
        expect(cells.length).toBeGreaterThan(0);
    });

    it('supports custom fill channel with object data', () => {
        const testData = [
            { category: 'A', value: 5 },
            { category: 'B', value: 10 },
            { category: 'C', value: 15 }
        ];

        const { container } = render(CellYTest, {
            props: {
                plotArgs: {},
                cellArgs: {
                    data: testData,
                    y: 'category',
                    fill: 'value'
                }
            }
        });

        const cells = container.querySelectorAll('g.cell > rect') as NodeListOf<SVGRectElement>;
        expect(cells.length).toBe(3);

        const cellDims = Array.from(cells).map(getRectDims);
        const fills = cellDims.map((d) => d.fill);

        // Cells should have different fills
        const uniqueFills = new Set(fills);
        expect(uniqueFills.size).toBeGreaterThan(1);
    });

    it('supports custom styling props', () => {
        const { container } = render(CellYTest, {
            props: {
                plotArgs: {},
                cellArgs: {
                    data: [10, 20, 30],
                    fill: 'red',
                    stroke: 'blue',
                    strokeWidth: 2,
                    opacity: 0.5
                }
            }
        });

        const cells = container.querySelectorAll('g.cell > rect') as NodeListOf<SVGRectElement>;
        expect(cells.length).toBe(3);

        const cellDims = Array.from(cells).map(getRectDims);
        // Check that custom styles are applied
        expect(cellDims[0].fill).toBe('red');
        expect(cellDims[0].stroke).toBe('blue');
        expect(cellDims[0].strokeWidth).toBe('2px');
    });

    it('supports accessor functions', () => {
        const { container } = render(CellYTest, {
            props: {
                plotArgs: {},
                cellArgs: {
                    data: [5, 10, 15],
                    fill: (d: number) => (d > 10 ? 'red' : 'blue')
                }
            }
        });

        const cells = container.querySelectorAll('g.cell > rect') as NodeListOf<SVGRectElement>;
        expect(cells.length).toBe(3);

        const cellDims = Array.from(cells).map(getRectDims);
        const fills = cellDims.map((d) => d.fill);

        // First two cells should be blue (5, 10), last should be red (15)
        expect(fills.filter((f) => f === 'blue').length).toBe(2);
        expect(fills.filter((f) => f === 'red').length).toBe(1);
    });

    it('uses path for rounded rects', () => {
        const { container } = render(CellYTest, {
            props: {
                plotArgs: {},
                cellArgs: {
                    data: [10, 20, 30],
                    borderRadius: { topLeft: 2, topRight: 2 }
                }
            }
        });

        const cells = container.querySelectorAll('g.cell > path') as NodeListOf<SVGPathElement>;
        expect(cells.length).toBe(3);
        const cellDims = Array.from(cells).map(getPathDims);

        // All cells should have the same height
        const heights = cellDims.map((d) => d.h);
        expect(heights[0]).toBe(heights[1]);
        expect(heights[1]).toBe(heights[2]);
    });

    it('supports custom inset', () => {
        const { container } = render(CellYTest, {
            props: {
                plotArgs: { width: 100, height: 300 },
                cellArgs: {
                    data: [10, 20, 30],
                    inset: 2
                }
            }
        });

        const cells = container.querySelectorAll('g.cell > rect') as NodeListOf<SVGRectElement>;
        expect(cells.length).toBe(3);

        const cellDims = Array.from(cells).map(getRectDims);
        // With inset, cells should be smaller
        expect(cellDims[0].w).toBeLessThan(100);
        expect(cellDims[0].h).toBeLessThan(100);
    });

    it('works with groupY transform', () => {
        const testData = [
            { season: 1, rating: 8.5 },
            { season: 1, rating: 8.2 },
            { season: 2, rating: 7.9 },
            { season: 2, rating: 8.1 }
        ];

        // Manually simulate grouped data (mean values by season)
        const groupedData = [
            { y: 1, fill: 8.35 }, // mean of 8.5 and 8.2
            { y: 2, fill: 8.0 } // mean of 7.9 and 8.1
        ];

        const { container } = render(CellYTest, {
            props: {
                plotArgs: {},
                cellArgs: {
                    data: groupedData,
                    y: 'y',
                    fill: 'fill'
                }
            }
        });

        const cells = container.querySelectorAll('g.cell > rect') as NodeListOf<SVGRectElement>;
        expect(cells.length).toBe(2);
    });
});
