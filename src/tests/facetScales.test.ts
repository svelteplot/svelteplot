import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import FacetScalesTest from './facetScales.test.svelte';
import { getTranslate } from './utils';

const data = [
    { x: 0, y: 0, gx: 'A', gy: 'P' },
    { x: 1, y: 1, gx: 'B', gy: 'Q' }
];

function getState(container: HTMLElement) {
    const el = container.querySelector('[data-testid="facet-scale-state"]') as HTMLElement;
    return {
        fxRange: JSON.parse(el.dataset.fxRange!),
        fxBandwidth: Number(el.dataset.fxBandwidth),
        fxPositions: JSON.parse(el.dataset.fxPositions!),
        fyRange: JSON.parse(el.dataset.fyRange!),
        fyBandwidth: Number(el.dataset.fyBandwidth),
        fyPositions: JSON.parse(el.dataset.fyPositions!),
        plotWidth: Number(el.dataset.plotWidth),
        plotHeight: Number(el.dataset.plotHeight)
    };
}

describe('usePlot fx/fy scales', () => {
    it('fx scale has valid range spanning plotWidth', () => {
        const { container } = render(FacetScalesTest, {
            props: {
                plotArgs: {
                    x: { domain: [0, 1] },
                    y: { domain: [0, 1] }
                },
                dotArgs: { data, x: 'x', y: 'y', fx: 'gx' }
            }
        });

        const state = getState(container);
        expect(state.fxRange).toHaveLength(2);
        expect(state.fxRange[0]).toBe(0);
        expect(state.fxRange[1]).toBe(state.plotWidth);
    });

    it('fx positions are finite and distinct', () => {
        const { container } = render(FacetScalesTest, {
            props: {
                plotArgs: {
                    x: { domain: [0, 1] },
                    y: { domain: [0, 1] }
                },
                dotArgs: { data, x: 'x', y: 'y', fx: 'gx' }
            }
        });

        const state = getState(container);
        expect(state.fxPositions).toHaveLength(2);
        expect(Number.isFinite(state.fxPositions[0])).toBe(true);
        expect(Number.isFinite(state.fxPositions[1])).toBe(true);
        expect(state.fxPositions[0]).not.toBe(state.fxPositions[1]);
    });

    it('fx bandwidth is positive', () => {
        const { container } = render(FacetScalesTest, {
            props: {
                plotArgs: {
                    x: { domain: [0, 1] },
                    y: { domain: [0, 1] }
                },
                dotArgs: { data, x: 'x', y: 'y', fx: 'gx' }
            }
        });

        const state = getState(container);
        expect(state.fxBandwidth).toBeGreaterThan(0);
    });

    it('fx scale positions match facet DOM positions', () => {
        const { container } = render(FacetScalesTest, {
            props: {
                plotArgs: {
                    x: { domain: [0, 1] },
                    y: { domain: [0, 1] }
                },
                dotArgs: { data, x: 'x', y: 'y', fx: 'gx' }
            }
        });

        const state = getState(container);
        const facets = container.querySelectorAll('g.facet') as NodeListOf<SVGGElement>;
        expect(facets.length).toBe(2);

        const domX = Array.from(facets).map((f) => getTranslate(f)[0]);
        expect(state.fxPositions[0]).toBeCloseTo(domX[0], 0);
        expect(state.fxPositions[1]).toBeCloseTo(domX[1], 0);
    });

    it('fy scale has valid range spanning plotHeight', () => {
        const { container } = render(FacetScalesTest, {
            props: {
                plotArgs: {
                    x: { domain: [0, 1] },
                    y: { domain: [0, 1] }
                },
                dotArgs: { data, x: 'x', y: 'y', fy: 'gy' }
            }
        });

        const state = getState(container);
        expect(state.fyRange).toHaveLength(2);
        expect(state.fyRange[0]).toBe(0);
        expect(state.fyRange[1]).toBe(state.plotHeight);
    });

    it('fy scale positions match facet DOM positions', () => {
        const { container } = render(FacetScalesTest, {
            props: {
                plotArgs: {
                    x: { domain: [0, 1] },
                    y: { domain: [0, 1] }
                },
                dotArgs: { data, x: 'x', y: 'y', fy: 'gy' }
            }
        });

        const state = getState(container);
        const facets = container.querySelectorAll('g.facet') as NodeListOf<SVGGElement>;
        expect(facets.length).toBe(2);

        const domY = Array.from(facets).map((f) => getTranslate(f)[1]);
        expect(state.fyPositions[0]).toBeCloseTo(domY[0], 0);
        expect(state.fyPositions[1]).toBeCloseTo(domY[1], 0);
    });

    it('custom padding is respected', () => {
        const { container: c1 } = render(FacetScalesTest, {
            props: {
                plotArgs: {
                    x: { domain: [0, 1] },
                    y: { domain: [0, 1] }
                },
                dotArgs: { data, x: 'x', y: 'y', fx: 'gx' }
            }
        });
        const defaultBw = getState(c1).fxBandwidth;

        const { container: c2 } = render(FacetScalesTest, {
            props: {
                plotArgs: {
                    x: { domain: [0, 1] },
                    y: { domain: [0, 1] },
                    fx: { padding: 0.3 }
                },
                dotArgs: { data, x: 'x', y: 'y', fx: 'gx' }
            }
        });
        const customBw = getState(c2).fxBandwidth;

        expect(customBw).toBeGreaterThan(0);
        expect(customBw).not.toBeCloseTo(defaultBw, 1);
    });

    it('no faceting gives empty domain and no positions', () => {
        const { container } = render(FacetScalesTest, {
            props: {
                plotArgs: {
                    x: { domain: [0, 1] },
                    y: { domain: [0, 1] }
                },
                dotArgs: { data, x: 'x', y: 'y' }
            }
        });

        const state = getState(container);
        // domain is empty when no faceting is used
        expect(state.fxPositions).toHaveLength(0);
        expect(state.fyPositions).toHaveLength(0);
    });
});
