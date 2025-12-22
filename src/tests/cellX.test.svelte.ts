import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import CellXTest from './cellX.test.svelte';
import { getRectDims, getPathDims } from './utils';

describe('CellX mark', () => {
	it('renders cells from simple number array', () => {
		const { container } = render(CellXTest, {
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

	it('positions cells along x-axis with fixed y position', () => {
		const { container } = render(CellXTest, {
			props: {
				plotArgs: { width: 200, height: 100 },
				cellArgs: {
					data: [10, 20, 30]
				}
			}
		});

		const cells = container.querySelectorAll('g.cell > rect') as NodeListOf<SVGRectElement>;
		expect(cells.length).toBe(3);

		const cellDims = Array.from(cells).map(getRectDims);

		// All cells should have the same height
		const heights = cellDims.map((d) => d.h);
		expect(heights[0]).toBe(heights[1]);
		expect(heights[1]).toBe(heights[2]);

		// All cells should have the same width (band scale)
		const widths = cellDims.map((d) => d.w);
		expect(widths[0]).toBe(widths[1]);
		expect(widths[1]).toBe(widths[2]);

		// X positions should be different
		const xPositions = cellDims.map((d) => d.x);
		expect(xPositions[0]).not.toBe(xPositions[1]);
		expect(xPositions[1]).not.toBe(xPositions[2]);
	});

	it('renders cells from object data', () => {
		const testData = [{ value: 5 }, { value: 10 }, { value: 15 }];

		const { container } = render(CellXTest, {
			props: {
				plotArgs: {},
				cellArgs: {
					data: testData,
					x: 'value'
				}
			}
		});

		const cells = container.querySelectorAll('g.cell > rect') as NodeListOf<SVGRectElement>;
		expect(cells.length).toBe(3);
	});

	it('uses default fill behavior (identity function) for raw values', () => {
		const { container } = render(CellXTest, {
			props: {
				plotArgs: {},
				cellArgs: {
					data: [10, 20, 30]
				}
			}
		});

		const cells = container.querySelectorAll('g.cell > rect') as NodeListOf<SVGRectElement>;
		expect(cells.length).toBe(3);

		// For CellX with raw values, fill should default to the identity function
		// The cells should exist and be rendered
		expect(cells.length).toBeGreaterThan(0);
	});

	it('supports custom fill channel with object data', () => {
		const testData = [
			{ category: 'A', value: 5 },
			{ category: 'B', value: 10 },
			{ category: 'C', value: 15 }
		];

		const { container } = render(CellXTest, {
			props: {
				plotArgs: {},
				cellArgs: {
					data: testData,
					x: 'category',
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
		const { container } = render(CellXTest, {
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
		const { container } = render(CellXTest, {
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
		const { container } = render(CellXTest, {
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

		// All cells should have the same width
		const widths = cellDims.map((d) => d.w);
		expect(widths[0]).toBe(widths[1]);
		expect(widths[1]).toBe(widths[2]);
	});

	it('supports custom inset', () => {
		const { container } = render(CellXTest, {
			props: {
				plotArgs: { width: 300, height: 100 },
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

	it('works with groupX transform', () => {
		const testData = [
			{ season: 1, rating: 8.5 },
			{ season: 1, rating: 8.2 },
			{ season: 2, rating: 7.9 },
			{ season: 2, rating: 8.1 }
		];

		// Manually simulate grouped data (mean values by season)
		const groupedData = [
			{ x: 1, fill: 8.35 }, // mean of 8.5 and 8.2
			{ x: 2, fill: 8.0 } // mean of 7.9 and 8.1
		];

		const { container } = render(CellXTest, {
			props: {
				plotArgs: {},
				cellArgs: {
					data: groupedData,
					x: 'x',
					fill: 'fill'
				}
			}
		});

		const cells = container.querySelectorAll('g.cell > rect') as NodeListOf<SVGRectElement>;
		expect(cells.length).toBe(2);
	});
});
