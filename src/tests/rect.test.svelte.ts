import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import RectTest from './rect.test.svelte';
import { getRectDims, getPathDims } from './utils';

const testData = [
    { x1: 0, x2: 1, y1: 0, y2: 1 },
    { x1: 1, x2: 2, y1: 0, y2: 1 },
    { x1: 0, x2: 1, y1: 1, y2: 2 },
    { x1: 1, x2: 2, y1: 1, y2: 2 }
];

// Rect mark rects have transform="translate(...)" while the FacetGrid
// background rect does not, so we use rect[transform] to select only mark rects.
const RECT_SEL = 'rect[transform]';
const PATH_SEL = 'path[transform]';

describe('Rect mark', () => {
    it('renders rects from data with x1/x2/y1/y2', () => {
        const { container } = render(RectTest, {
            props: {
                plotArgs: {},
                rectArgs: {
                    data: testData,
                    x1: 'x1',
                    x2: 'x2',
                    y1: 'y1',
                    y2: 'y2'
                }
            }
        });

        const rects = container.querySelectorAll(RECT_SEL) as NodeListOf<SVGRectElement>;
        expect(rects.length).toBe(4);
    });

    it('rect positions and dimensions are correct', () => {
        const { container } = render(RectTest, {
            props: {
                plotArgs: { width: 200, height: 200, margin: 0 },
                rectArgs: {
                    data: testData,
                    x1: 'x1',
                    x2: 'x2',
                    y1: 'y1',
                    y2: 'y2'
                }
            }
        });

        const rects = container.querySelectorAll(RECT_SEL) as NodeListOf<SVGRectElement>;
        expect(rects.length).toBe(4);

        const rectDims = Array.from(rects).map(getRectDims);
        // All rects should have equal width and height (2x2 grid in a 200x200 plot)
        const widths = rectDims.map((d) => d.w);
        const heights = rectDims.map((d) => d.h);
        expect(widths[0]).toBe(widths[1]);
        expect(widths[0]).toBe(widths[2]);
        expect(heights[0]).toBe(heights[1]);
        expect(heights[0]).toBe(heights[2]);

        // Rects in different columns should have different x positions
        expect(rectDims[0].x).not.toBe(rectDims[1].x);
        // Rects in different rows should have different y positions
        expect(rectDims[0].y).not.toBe(rectDims[2].y);
    });

    it('fill channel maps to distinct colors', () => {
        const fillData = [
            { x1: 0, x2: 1, y1: 0, y2: 1, cat: 'a' },
            { x1: 1, x2: 2, y1: 0, y2: 1, cat: 'b' },
            { x1: 0, x2: 1, y1: 1, y2: 2, cat: 'a' },
            { x1: 1, x2: 2, y1: 1, y2: 2, cat: 'b' }
        ];

        const { container } = render(RectTest, {
            props: {
                plotArgs: {},
                rectArgs: {
                    data: fillData,
                    x1: 'x1',
                    x2: 'x2',
                    y1: 'y1',
                    y2: 'y2',
                    fill: 'cat'
                }
            }
        });

        const rects = container.querySelectorAll(RECT_SEL) as NodeListOf<SVGRectElement>;
        const fills = Array.from(rects)
            .map(getRectDims)
            .map((d) => d.fill);
        const uniqueFills = new Set(fills);
        expect(uniqueFills.size).toBe(2);
    });

    it('custom stroke and strokeWidth', () => {
        const { container } = render(RectTest, {
            props: {
                plotArgs: {},
                rectArgs: {
                    data: testData,
                    x1: 'x1',
                    x2: 'x2',
                    y1: 'y1',
                    y2: 'y2',
                    stroke: 'black',
                    strokeWidth: 2
                }
            }
        });

        const rects = container.querySelectorAll(RECT_SEL) as NodeListOf<SVGRectElement>;
        expect(rects.length).toBe(4);

        const rectDims = Array.from(rects).map(getRectDims);
        expect(rectDims[0].stroke).toBe('black');
        expect(rectDims[0].strokeWidth).toBe('2px');
    });

    it('borderRadius renders path elements', () => {
        const { container } = render(RectTest, {
            props: {
                plotArgs: {},
                rectArgs: {
                    data: testData,
                    x1: 'x1',
                    x2: 'x2',
                    y1: 'y1',
                    y2: 'y2',
                    borderRadius: { topLeft: 2 }
                }
            }
        });

        const paths = container.querySelectorAll(PATH_SEL) as NodeListOf<SVGPathElement>;
        expect(paths.length).toBe(4);

        const pathDims = Array.from(paths).map(getPathDims);
        // All paths should have equal width and height
        expect(pathDims[0].w).toBe(pathDims[1].w);
        expect(pathDims[0].h).toBe(pathDims[1].h);
    });

    it('inset reduces rect dimensions', () => {
        const { container: withoutInset } = render(RectTest, {
            props: {
                plotArgs: { width: 200, height: 200, margin: 0 },
                rectArgs: {
                    data: [{ x1: 0, x2: 2, y1: 0, y2: 2 }],
                    x1: 'x1',
                    x2: 'x2',
                    y1: 'y1',
                    y2: 'y2'
                }
            }
        });

        const { container: withInset } = render(RectTest, {
            props: {
                plotArgs: { width: 200, height: 200, margin: 0 },
                rectArgs: {
                    data: [{ x1: 0, x2: 2, y1: 0, y2: 2 }],
                    x1: 'x1',
                    x2: 'x2',
                    y1: 'y1',
                    y2: 'y2',
                    inset: 5
                }
            }
        });

        const rectWithout = withoutInset.querySelector(RECT_SEL) as SVGRectElement;
        const rectWith = withInset.querySelector(RECT_SEL) as SVGRectElement;
        const dimsWithout = getRectDims(rectWithout);
        const dimsWith = getRectDims(rectWith);

        // Inset should reduce dimensions
        expect(dimsWith.w).toBeLessThan(dimsWithout.w);
        expect(dimsWith.h).toBeLessThan(dimsWithout.h);
    });

    it('single data point', () => {
        const { container } = render(RectTest, {
            props: {
                plotArgs: {},
                rectArgs: {
                    data: [{ x1: 0, x2: 1, y1: 0, y2: 1 }],
                    x1: 'x1',
                    x2: 'x2',
                    y1: 'y1',
                    y2: 'y2'
                }
            }
        });

        const rects = container.querySelectorAll(RECT_SEL) as NodeListOf<SVGRectElement>;
        expect(rects.length).toBe(1);
    });
});
