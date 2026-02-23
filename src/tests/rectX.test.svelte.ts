import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
// @ts-ignore - svelte-check errors on .svelte imports, tsc does not
import RectXTest from './rectX.test.svelte';
import { getRectDims } from './utils';

// Rect mark rects have transform="translate(...)" while the FacetGrid
// background rect does not, so we use rect[transform] to select only mark rects.
const RECT_SEL = 'rect[transform]';

describe('RectX mark', () => {
    it('renders rects from raw number array', () => {
        const { container } = render(RectXTest, {
            props: {
                plotArgs: {},
                rectArgs: {
                    data: [1, 2, 3, 4, 5]
                }
            }
        });

        const rects = container.querySelectorAll(RECT_SEL) as NodeListOf<SVGRectElement>;
        expect(rects.length).toBe(5);
    });

    it('rect widths vary with data values', () => {
        const { container } = render(RectXTest, {
            props: {
                plotArgs: {},
                rectArgs: {
                    data: [1, 2, 3, 4, 5]
                }
            }
        });

        const rects = container.querySelectorAll(RECT_SEL) as NodeListOf<SVGRectElement>;
        const rectDims = Array.from(rects).map(getRectDims);

        // Widths should increase with data values
        const widths = rectDims.map((d) => d.w);
        for (let i = 1; i < widths.length; i++) {
            expect(widths[i]).toBeGreaterThan(widths[i - 1]);
        }
    });

    it('custom fill color', () => {
        const { container } = render(RectXTest, {
            props: {
                plotArgs: {},
                rectArgs: {
                    data: [1, 2, 3],
                    fill: 'red'
                }
            }
        });

        const rects = container.querySelectorAll(RECT_SEL) as NodeListOf<SVGRectElement>;
        expect(rects.length).toBe(3);

        const rectDims = Array.from(rects).map(getRectDims);
        expect(rectDims[0].fill).toBe('red');
        expect(rectDims[1].fill).toBe('red');
        expect(rectDims[2].fill).toBe('red');
    });

    it('custom strokeWidth', () => {
        const { container } = render(RectXTest, {
            props: {
                plotArgs: {},
                rectArgs: {
                    data: [1, 2, 3],
                    strokeWidth: 3
                }
            }
        });

        const rects = container.querySelectorAll(RECT_SEL) as NodeListOf<SVGRectElement>;
        expect(rects.length).toBe(3);

        const rectDims = Array.from(rects).map(getRectDims);
        expect(rectDims[0].strokeWidth).toBe('3px');
    });

    it('single data point', () => {
        const { container } = render(RectXTest, {
            props: {
                plotArgs: {},
                rectArgs: {
                    data: [42]
                }
            }
        });

        const rects = container.querySelectorAll(RECT_SEL) as NodeListOf<SVGRectElement>;
        expect(rects.length).toBe(1);
    });

    it('zero and negative values', () => {
        const { container } = render(RectXTest, {
            props: {
                plotArgs: {},
                rectArgs: {
                    data: [-5, 0, 5]
                }
            }
        });

        const rects = container.querySelectorAll(RECT_SEL) as NodeListOf<SVGRectElement>;
        expect(rects.length).toBe(3);
    });
});
