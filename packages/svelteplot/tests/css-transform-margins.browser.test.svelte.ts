import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
// @ts-ignore
import CssTransformMarginsTest from './css-transform-margins.test.svelte';

async function readMargins(container: HTMLElement) {
    const marginLeft = Number(
        container.querySelector('[data-testid="margin-probe-left"]')?.textContent
    );
    const marginBottom = Number(
        container.querySelector('[data-testid="margin-probe-bottom"]')?.textContent
    );
    return { marginLeft, marginBottom };
}

async function resizeChart(
    component: { rerender: (props: Record<string, unknown>) => Promise<void> },
    from: number,
    to: number,
    step = 3
) {
    for (let w = from + step; w <= to; w += step) {
        await component.rerender({ width: w });
        await new Promise((r) => setTimeout(r, 0));
    }
}

describe('css transform auto margins (browser)', () => {
    it('B1: survives resize churn under scale(1.3) without effect_update_depth_exceeded', async () => {
        const errors: string[] = [];
        const onError = (event: Event) => {
            errors.push((event as ErrorEvent).message ?? String(event));
        };
        window.addEventListener('error', onError);

        const screen = await render(CssTransformMarginsTest, {
            props: { width: 400, scale: 1.3 }
        });
        await resizeChart(screen, 400, 500);
        window.removeEventListener('error', onError);

        expect(errors.some((e) => e.includes('effect_update_depth_exceeded'))).toBe(false);
    });

    it('B4: scale-invariant margins between scale(1) and scale(1.3)', async () => {
        const scaled = await render(CssTransformMarginsTest, {
            props: { width: 400, scale: 1.3 }
        });
        await resizeChart(scaled, 400, 500);
        const scaledMargins = await readMargins(scaled.container);

        const unscaled = await render(CssTransformMarginsTest, {
            props: { width: 400, scale: 1 }
        });
        await resizeChart(unscaled, 400, 500);
        const unscaledMargins = await readMargins(unscaled.container);

        expect(Math.abs(scaledMargins.marginLeft - unscaledMargins.marginLeft)).toBeLessThanOrEqual(
            1
        );
        expect(
            Math.abs(scaledMargins.marginBottom - unscaledMargins.marginBottom)
        ).toBeLessThanOrEqual(1);
    });

    it('B2: scale-invariant margins with tickRotate 0', async () => {
        const screen = await render(CssTransformMarginsTest, {
            props: { width: 400, scale: 1.3, tickRotate: 0 }
        });
        await resizeChart(screen, 400, 500);
        const { marginBottom } = await readMargins(screen.container);
        expect(marginBottom).toBeGreaterThan(5);
    });

    it('B3: scale-invariant margins with tickRotate 45', async () => {
        const rotatedAtOne = await render(CssTransformMarginsTest, {
            props: { width: 400, scale: 1, tickRotate: 45 }
        });
        await resizeChart(rotatedAtOne, 400, 500);
        const atOne = await readMargins(rotatedAtOne.container);

        const rotatedAtScale = await render(CssTransformMarginsTest, {
            props: { width: 400, scale: 1.3, tickRotate: 45 }
        });
        await resizeChart(rotatedAtScale, 400, 500);
        const atScale = await readMargins(rotatedAtScale.container);

        expect(Math.abs(atScale.marginLeft - atOne.marginLeft)).toBeLessThanOrEqual(1);
        expect(Math.abs(atScale.marginBottom - atOne.marginBottom)).toBeLessThanOrEqual(1);

        const unrotated = await render(CssTransformMarginsTest, {
            props: { width: 400, scale: 1, tickRotate: 0 }
        });
        await resizeChart(unrotated, 400, 500);
        const baseline = await readMargins(unrotated.container);

        expect(atOne.marginBottom).toBeGreaterThan(baseline.marginBottom);
    });
});