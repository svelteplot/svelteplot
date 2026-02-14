import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import UsePlotTest from './usePlot.test.svelte';

describe('usePlot', () => {
    it('returns plot state with correct height', () => {
        const { container } = render(UsePlotTest, {
            props: { width: 200, height: 150 }
        });
        const el = container.querySelector('[data-testid="plot-state"]')!;
        expect(el.getAttribute('data-height')).toBe('150');
    });

    it('returns default dimensions when no props given', () => {
        const { container } = render(UsePlotTest);
        const el = container.querySelector('[data-testid="plot-state"]')!;
        expect(el.getAttribute('data-height')).toBe('100');
    });

    it('exposes plotWidth and plotHeight', () => {
        const { container } = render(UsePlotTest, {
            props: { width: 100, height: 100 }
        });
        const el = container.querySelector('[data-testid="plot-state"]')!;
        // plotWidth/plotHeight are width/height minus margins
        const plotWidth = Number(el.getAttribute('data-plot-width'));
        const plotHeight = Number(el.getAttribute('data-plot-height'));
        expect(plotWidth).toBeGreaterThan(0);
        expect(plotWidth).toBeLessThanOrEqual(100);
        expect(plotHeight).toBeGreaterThan(0);
        expect(plotHeight).toBeLessThanOrEqual(100);
    });
});

describe('setPlot', () => {
    it('creates PlotState used by Plot component', () => {
        // setPlot is called internally by Plot, so we verify
        // it works indirectly through usePlot
        const { container } = render(UsePlotTest, {
            props: { width: 300, height: 250 }
        });
        const el = container.querySelector('[data-testid="plot-state"]')!;
        expect(el.getAttribute('data-height')).toBe('250');
    });
});
