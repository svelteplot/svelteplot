import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
// @ts-ignore - svelte-check errors on .svelte imports, tsc does not
import PointerFacetedTest from './pointer-faceted.test.svelte';

/**
 * With margin=0, width=200, two fx facets ('A','B') with default paddingInner=0.1:
 * d3.scaleBand domain=['A','B'] range=[0,200] paddingInner=0.1
 *   → bandwidth ≈ 95, A starts at 0, B starts at ~105
 *
 * For each facet, x domain [0,100] maps to [0, facetWidth≈95].
 * A point at x=50 within facet A is at pixel ~47.5 from plot body left.
 * A point at x=50 within facet B is at pixel ~105 + 47.5 ≈ 152.5 from plot body left.
 *
 * In jsdom, getBoundingClientRect returns {left:0, top:0}, so clientX = pixelX.
 * The DOM walk won't find a facet (target is .plot-body div), so detectFacet
 * falls back to band inversion: clientX < bandwidth → facet A, else facet B.
 *
 * maxDistance defaults to 15px, so cursor must be within 15px of the projected point.
 */

function pointerMove(plotBody: HTMLElement, clientX: number, clientY: number) {
    plotBody.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY, bubbles: true }));
}

const defaultPlotArgs = {
    x: { domain: [0, 100] },
    y: { domain: [0, 100] }
};

describe('Pointer mark (faceted)', () => {
    it('selects only facet A data when pointer is in facet A', async () => {
        const onupdate = vi.fn();

        const { container } = render(PointerFacetedTest, {
            props: {
                plotArgs: defaultPlotArgs,
                pointerArgs: {
                    data: [
                        { x: 50, y: 50, fx: 'A', id: 'a1' },
                        { x: 50, y: 50, fx: 'B', id: 'b1' }
                    ],
                    x: 'x',
                    y: 'y',
                    fx: 'fx',
                    onupdate
                }
            }
        });

        await tick();
        const plotBody = container.querySelector('.plot-body') as HTMLElement;

        // Point x=50 in [0,100] projects to ~47.5px within facet A (bandwidth≈95)
        // Cursor at clientX=48 is <1px from the projected point
        pointerMove(plotBody, 48, 50);
        await tick();

        expect(onupdate).toHaveBeenCalled();
        const lastCall = onupdate.mock.lastCall![0];
        expect(lastCall).toHaveLength(1);
        expect(lastCall[0]).toMatchObject({ id: 'a1' });
    });

    it('selects only facet B data when pointer is in facet B', async () => {
        const onupdate = vi.fn();

        const { container } = render(PointerFacetedTest, {
            props: {
                plotArgs: defaultPlotArgs,
                pointerArgs: {
                    data: [
                        { x: 50, y: 50, fx: 'A', id: 'a1' },
                        { x: 50, y: 50, fx: 'B', id: 'b1' }
                    ],
                    x: 'x',
                    y: 'y',
                    fx: 'fx',
                    onupdate
                }
            }
        });

        await tick();
        const plotBody = container.querySelector('.plot-body') as HTMLElement;

        // Point x=50 in [0,100] projects to ~47.5px within facet B
        // Facet B starts at ~105, so clientX ≈ 105 + 48 = 153
        pointerMove(plotBody, 153, 50);
        await tick();

        expect(onupdate).toHaveBeenCalled();
        const lastCall = onupdate.mock.lastCall![0];
        expect(lastCall).toHaveLength(1);
        expect(lastCall[0]).toMatchObject({ id: 'b1' });
    });

    it('non-faceted regression: selects nearest point as before', async () => {
        const onupdate = vi.fn();

        const { container } = render(PointerFacetedTest, {
            props: {
                plotArgs: defaultPlotArgs,
                pointerArgs: {
                    data: [
                        { x: 25, y: 75 },
                        { x: 75, y: 25 }
                    ],
                    x: 'x',
                    y: 'y',
                    onupdate
                }
            }
        });

        await tick();
        const plotBody = container.querySelector('.plot-body') as HTMLElement;

        // Point {x:25, y:75} maps to pixel ~(50, 25) with width=200
        // Point {x:75, y:25} maps to pixel ~(150, 75)
        // Cursor at (51, 25) is closest to first point
        pointerMove(plotBody, 51, 25);
        await tick();

        expect(onupdate).toHaveBeenCalled();
        const lastCall = onupdate.mock.lastCall![0];
        expect(lastCall).toHaveLength(1);
        expect(lastCall[0]).toMatchObject({ x: 25, y: 75 });
    });

    it('selects nearest point with non-zero margins', async () => {
        const onupdate = vi.fn();

        const { container } = render(PointerFacetedTest, {
            props: {
                plotArgs: {
                    ...defaultPlotArgs,
                    margin: 20
                },
                pointerArgs: {
                    data: [{ x: 50, y: 50 }],
                    x: 'x',
                    y: 'y',
                    onupdate
                }
            }
        });

        await tick();
        const plotBody = container.querySelector('.plot-body') as HTMLElement;

        // width=200, margin=20 → plotWidth=160, x range=[20,180], y range=[80,20]
        // x=50 → projectX = 20 + (50/100)*160 = 100
        // y=50 → projectY = 80 + (50/100)*(20-80) = 50
        // In jsdom facetRect.left=0, so clientX=100, clientY=50 should match
        pointerMove(plotBody, 100, 50);
        await tick();

        expect(onupdate).toHaveBeenCalled();
        const lastCall = onupdate.mock.lastCall![0];
        expect(lastCall).toHaveLength(1);
        expect(lastCall[0]).toMatchObject({ x: 50, y: 50 });
    });

    it('handles empty data without crashing', async () => {
        const onupdate = vi.fn();

        const { container } = render(PointerFacetedTest, {
            props: {
                plotArgs: defaultPlotArgs,
                pointerArgs: {
                    data: [],
                    x: 'x',
                    y: 'y',
                    fx: 'fx',
                    onupdate
                }
            }
        });

        await tick();
        const plotBody = container.querySelector('.plot-body') as HTMLElement;

        pointerMove(plotBody, 50, 50);
        await tick();

        expect(onupdate).toHaveBeenCalledWith([]);
    });
});
