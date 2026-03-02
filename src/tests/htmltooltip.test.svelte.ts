import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
// @ts-ignore - svelte-check errors on .svelte imports, tsc does not
import HTMLTooltipTest from './htmltooltip.test.svelte';

/**
 * Same layout as faceted Pointer tests:
 * width=200, margin=0, two fx facets A/B with paddingInner=0.1
 * → bandwidth≈95, A starts at 0, B starts at ~105
 *
 * x domain [0,100] maps to [0, facetWidth≈95] within each facet.
 * Point at x=50 → pixel ~47.5 within its facet.
 */

function pointerMove(plotBody: HTMLElement, clientX: number, clientY: number) {
    plotBody.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY, bubbles: true }));
}

function pointerLeave(plotBody: HTMLElement) {
    plotBody.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
}

const defaultPlotArgs = {
    x: { domain: [0, 100] },
    y: { domain: [0, 100] }
};

describe('HTMLTooltip (faceted)', () => {
    it('tooltip datum matches hovered facet A data', async () => {
        const { container } = render(HTMLTooltipTest, {
            props: {
                plotArgs: defaultPlotArgs,
                tooltipArgs: {
                    data: [
                        { x: 50, y: 50, fx: 'A', id: 'a1' },
                        { x: 50, y: 50, fx: 'B', id: 'b1' }
                    ],
                    x: 'x',
                    y: 'y',
                    fx: 'fx'
                }
            }
        });

        await tick();
        const plotBody = container.querySelector('.plot-body') as HTMLElement;

        // Point at x=50 in facet A projects to ~47.5px from plot body left
        pointerMove(plotBody, 48, 50);
        await tick();

        const tooltip = container.querySelector('.svelteplot-tooltip') as HTMLElement;
        expect(tooltip).not.toBeNull();
        // Tooltip should be visible (not hidden)
        expect(tooltip.classList.contains('hide')).toBe(false);

        // Parse datum from the test wrapper's data attribute
        const span = container.querySelector('.tooltip-content') as HTMLElement;
        const datumStr = span?.dataset?.datum;
        expect(datumStr).toBeDefined();
        const datum = JSON.parse(datumStr!);
        expect(datum).toMatchObject({ id: 'a1', fx: 'A' });
    });

    it('tooltip datum matches hovered facet B data', async () => {
        const { container } = render(HTMLTooltipTest, {
            props: {
                plotArgs: defaultPlotArgs,
                tooltipArgs: {
                    data: [
                        { x: 50, y: 50, fx: 'A', id: 'a1' },
                        { x: 50, y: 50, fx: 'B', id: 'b1' }
                    ],
                    x: 'x',
                    y: 'y',
                    fx: 'fx'
                }
            }
        });

        await tick();
        const plotBody = container.querySelector('.plot-body') as HTMLElement;

        // Point at x=50 in facet B: facet B starts at ~105, so clientX ≈ 105+48=153
        pointerMove(plotBody, 153, 50);
        await tick();

        const span = container.querySelector('.tooltip-content') as HTMLElement;
        const datumStr = span?.dataset?.datum;
        expect(datumStr).toBeDefined();
        const datum = JSON.parse(datumStr!);
        expect(datum).toMatchObject({ id: 'b1', fx: 'B' });
    });

    it('non-faceted regression: finds nearest point', async () => {
        const { container } = render(HTMLTooltipTest, {
            props: {
                plotArgs: defaultPlotArgs,
                tooltipArgs: {
                    data: [
                        { x: 50, y: 50, id: 'p1' },
                        { x: 80, y: 20, id: 'p2' }
                    ],
                    x: 'x',
                    y: 'y'
                }
            }
        });

        await tick();
        const plotBody = container.querySelector('.plot-body') as HTMLElement;

        // Point p1 at x=50 → pixel ~100 (width=200, domain=[0,100])
        // Point p2 at x=80 → pixel ~160
        // Cursor at 101 is closest to p1
        pointerMove(plotBody, 101, 50);
        await tick();

        const span = container.querySelector('.tooltip-content') as HTMLElement;
        const datumStr = span?.dataset?.datum;
        expect(datumStr).toBeDefined();
        const datum = JSON.parse(datumStr!);
        expect(datum).toMatchObject({ id: 'p1' });
    });

    it('tooltip hides on pointerleave', async () => {
        const { container } = render(HTMLTooltipTest, {
            props: {
                plotArgs: defaultPlotArgs,
                tooltipArgs: {
                    data: [{ x: 50, y: 50 }],
                    x: 'x',
                    y: 'y'
                }
            }
        });

        await tick();
        const plotBody = container.querySelector('.plot-body') as HTMLElement;

        // First move to select a point
        pointerMove(plotBody, 100, 50);
        await tick();

        // Then leave
        pointerLeave(plotBody);
        await tick();

        const tooltip = container.querySelector('.svelteplot-tooltip') as HTMLElement;
        expect(tooltip.classList.contains('hide')).toBe(true);
    });
});
