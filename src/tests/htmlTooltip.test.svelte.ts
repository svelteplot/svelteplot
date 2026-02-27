import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
// @ts-expect-error - Svelte component has no typed default export
import HTMLTooltipTest from './htmlTooltip.test.svelte';

const data = [
    { x: 20, y: 80, label: 'A' },
    { x: 50, y: 50, label: 'B' },
    { x: 80, y: 20, label: 'C' }
];

const defaultPlotArgs = {
    x: { domain: [0, 100] },
    y: { domain: [0, 100] }
};

function pointerMove(el: HTMLElement, clientX: number, clientY: number) {
    el.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY, bubbles: true }));
}

function pointerLeave(el: HTMLElement) {
    el.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
}

function getPlotBody(container: HTMLElement): HTMLElement {
    const body = container.querySelector('.plot-body');
    if (!body) throw new Error('.plot-body not found');
    return body as HTMLElement;
}

function getTooltip(container: HTMLElement): HTMLElement {
    const el = container.querySelector('.svelteplot-tooltip');
    if (!el) throw new Error('.svelteplot-tooltip not found');
    return el as HTMLElement;
}

describe('HTMLTooltip mark', () => {
    it('renders tooltip element, initially hidden', async () => {
        const { container } = render(HTMLTooltipTest, {
            props: {
                plotArgs: defaultPlotArgs,
                dotArgs: { data, x: 'x', y: 'y' },
                tooltipArgs: { data, x: 'x', y: 'y' }
            }
        });
        await tick();

        const tooltip = getTooltip(container);
        expect(tooltip.className).toContain('hide');
        expect(container.querySelector('.tooltip-content')).toBeNull();
    });

    it('shows tooltip on pointer near data point', async () => {
        const { container } = render(HTMLTooltipTest, {
            props: {
                plotArgs: defaultPlotArgs,
                dotArgs: { data, x: 'x', y: 'y' },
                tooltipArgs: { data, x: 'x', y: 'y' }
            }
        });
        await tick();

        const plotBody = getPlotBody(container);
        pointerMove(plotBody, 51, 51);
        await tick();

        const tooltip = getTooltip(container);
        expect(tooltip.className).not.toContain('hide');
        expect(container.querySelector('.tooltip-content')).not.toBeNull();
    });

    it('hides tooltip on pointerleave', async () => {
        const { container } = render(HTMLTooltipTest, {
            props: {
                plotArgs: defaultPlotArgs,
                dotArgs: { data, x: 'x', y: 'y' },
                tooltipArgs: { data, x: 'x', y: 'y' }
            }
        });
        await tick();

        const plotBody = getPlotBody(container);
        pointerMove(plotBody, 50, 50);
        await tick();

        const tooltip = getTooltip(container);
        expect(tooltip.className).not.toContain('hide');

        pointerLeave(plotBody);
        await tick();

        expect(tooltip.className).toContain('hide');
        expect(container.querySelector('.tooltip-content')).toBeNull();
    });

    it('passes the nearest datum to children snippet', async () => {
        const { container } = render(HTMLTooltipTest, {
            props: {
                plotArgs: defaultPlotArgs,
                dotArgs: { data, x: 'x', y: 'y' },
                tooltipArgs: { data, x: 'x', y: 'y' }
            }
        });
        await tick();

        const plotBody = getPlotBody(container);
        // Point A: data (20, 80) -> pixel (20, 20) due to y inversion
        pointerMove(plotBody, 21, 21);
        await tick();

        const content = container.querySelector('.tooltip-content');
        expect(content).not.toBeNull();
        expect(content!.getAttribute('data-label')).toBe('A');
        expect(content!.textContent).toBe('A');
    });

    it('does not show when pointer is beyond 25px radius', async () => {
        const { container } = render(HTMLTooltipTest, {
            props: {
                plotArgs: defaultPlotArgs,
                dotArgs: { data, x: 'x', y: 'y' },
                tooltipArgs: { data, x: 'x', y: 'y' }
            }
        });
        await tick();

        const plotBody = getPlotBody(container);
        // Point (0, 50): nearest is A at pixel (20, 20), distance ~36px > 25px
        pointerMove(plotBody, 0, 50);
        await tick();

        const tooltip = getTooltip(container);
        expect(tooltip.className).toContain('hide');
    });

    it('updates datum when moving to different point', async () => {
        const { container } = render(HTMLTooltipTest, {
            props: {
                plotArgs: defaultPlotArgs,
                dotArgs: { data, x: 'x', y: 'y' },
                tooltipArgs: { data, x: 'x', y: 'y' }
            }
        });
        await tick();

        const plotBody = getPlotBody(container);
        pointerMove(plotBody, 50, 50);
        await tick();

        let content = container.querySelector('.tooltip-content');
        expect(content!.getAttribute('data-label')).toBe('B');

        pointerMove(plotBody, 80, 80);
        await tick();

        content = container.querySelector('.tooltip-content');
        expect(content!.getAttribute('data-label')).toBe('C');
    });

    it('positions tooltip at projected coordinates', async () => {
        const { container } = render(HTMLTooltipTest, {
            props: {
                plotArgs: defaultPlotArgs,
                dotArgs: { data, x: 'x', y: 'y' },
                tooltipArgs: { data, x: 'x', y: 'y' }
            }
        });
        await tick();

        const plotBody = getPlotBody(container);
        pointerMove(plotBody, 50, 50);
        await tick();

        const tooltip = getTooltip(container);
        expect(tooltip.style.left).toBe('50px');
        expect(tooltip.style.top).toBe('50px');
    });

    it('handles empty data without crashing', async () => {
        const { container } = render(HTMLTooltipTest, {
            props: {
                plotArgs: defaultPlotArgs,
                dotArgs: { data, x: 'x', y: 'y' },
                tooltipArgs: { data: [], x: 'x', y: 'y' }
            }
        });
        await tick();

        const plotBody = getPlotBody(container);
        pointerMove(plotBody, 50, 50);
        await tick();

        const tooltip = getTooltip(container);
        expect(tooltip.className).toContain('hide');
    });
});
