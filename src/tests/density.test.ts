import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import DensityTest from './density.test.svelte';
import DensitySharedScaleTest from './densitySharedScale.test.svelte';

// Small synthetic dataset: two clusters
const cluster1 = Array.from({ length: 20 }, (_, i) => ({
    x: 2 + (i % 5) * 0.1,
    y: 2 + Math.floor(i / 5) * 0.1,
    group: 'A'
}));
const cluster2 = Array.from({ length: 20 }, (_, i) => ({
    x: 8 + (i % 5) * 0.1,
    y: 8 + Math.floor(i / 5) * 0.1,
    group: 'B'
}));
const testData = [...cluster1, ...cluster2];

describe('Density mark', () => {
    it('renders a density group element', () => {
        const { container } = render(DensityTest, {
            props: {
                plotArgs: {},
                densityArgs: {
                    data: testData,
                    x: 'x',
                    y: 'y'
                }
            }
        });
        const g = container.querySelector('g[aria-label="density"]');
        expect(g).not.toBeNull();
    });

    it('renders contour paths for data with two clusters', () => {
        const { container } = render(DensityTest, {
            props: {
                plotArgs: {},
                densityArgs: {
                    data: testData,
                    x: 'x',
                    y: 'y',
                    thresholds: 5
                }
            }
        });
        const paths = container.querySelectorAll('g[aria-label="density"] > path');
        // With two dense clusters and 4 threshold levels (thresholds-1), we should
        // have at least one rendered path.
        expect(paths.length).toBeGreaterThan(0);
    });

    it('applies fill color when fill is specified', () => {
        const { container } = render(DensityTest, {
            props: {
                plotArgs: {},
                densityArgs: {
                    data: testData,
                    x: 'x',
                    y: 'y',
                    fill: 'steelblue',
                    thresholds: 10
                }
            }
        });
        const paths = container.querySelectorAll(
            'g[aria-label="density"] > path'
        ) as NodeListOf<SVGPathElement>;
        expect(paths.length).toBeGreaterThan(0);
        // All rendered paths should have fill:steelblue
        expect(Array.from(paths)[0].style.fill).toBe('steelblue');
    });

    it('applies stroke color when stroke is specified', () => {
        const { container } = render(DensityTest, {
            props: {
                plotArgs: {},
                densityArgs: {
                    data: testData,
                    x: 'x',
                    y: 'y',
                    stroke: 'red',
                    thresholds: 10
                }
            }
        });
        const paths = container.querySelectorAll(
            'g[aria-label="density"] > path'
        ) as NodeListOf<SVGPathElement>;
        expect(paths.length).toBeGreaterThan(0);
        expect(Array.from(paths)[0].style.stroke).toBe('red');
    });

    it('renders nothing for null data', () => {
        const { container } = render(DensityTest, {
            props: {
                plotArgs: {},
                densityArgs: {
                    data: null,
                    x: 'x',
                    y: 'y'
                }
            }
        });
        const paths = container.querySelectorAll('g[aria-label="density"] > path');
        expect(paths.length).toBe(0);
    });

    it('renders nothing for empty data', () => {
        const { container } = render(DensityTest, {
            props: {
                plotArgs: {},
                densityArgs: {
                    data: [],
                    x: 'x',
                    y: 'y'
                }
            }
        });
        const paths = container.querySelectorAll('g[aria-label="density"] > path');
        expect(paths.length).toBe(0);
    });

    it('accepts explicit threshold array', () => {
        const { container } = render(DensityTest, {
            props: {
                plotArgs: {},
                densityArgs: {
                    data: testData,
                    x: 'x',
                    y: 'y',
                    thresholds: [5, 10, 20]
                }
            }
        });
        const g = container.querySelector('g[aria-label="density"]');
        expect(g).not.toBeNull();
    });

    it('supports function accessor for x and y', () => {
        const { container } = render(DensityTest, {
            props: {
                plotArgs: {},
                densityArgs: {
                    data: testData,
                    x: (d: any) => d.x,
                    y: (d: any) => d.y,
                    thresholds: 5
                }
            }
        });
        const paths = container.querySelectorAll('g[aria-label="density"] > path');
        expect(paths.length).toBeGreaterThan(0);
    });

    it('applies custom className', () => {
        const { container } = render(DensityTest, {
            props: {
                plotArgs: {},
                densityArgs: {
                    data: testData,
                    x: 'x',
                    y: 'y',
                    class: 'my-density'
                }
            }
        });
        const g = container.querySelector('g.my-density');
        expect(g).not.toBeNull();
    });

    it('applies strokeMiterlimit in style', () => {
        const { container } = render(DensityTest, {
            props: {
                plotArgs: {},
                densityArgs: {
                    data: testData,
                    x: 'x',
                    y: 'y',
                    strokeMiterlimit: 2,
                    thresholds: 10
                }
            }
        });
        const paths = container.querySelectorAll(
            'g[aria-label="density"] > path'
        ) as NodeListOf<SVGPathElement>;
        expect(paths.length).toBeGreaterThan(0);
        // Check via the CSSOM property (jsdom may normalize the style string)
        const hasLimit = Array.from(paths).some(
            (p) => p.style.getPropertyValue('stroke-miterlimit') === '2'
        );
        expect(hasLimit).toBe(true);
    });

    it('respects custom bandwidth', () => {
        // Two renders with different bandwidths should produce different outputs
        const { container: c1 } = render(DensityTest, {
            props: {
                plotArgs: {},
                densityArgs: { data: testData, x: 'x', y: 'y', bandwidth: 5, thresholds: 3 }
            }
        });
        const { container: c2 } = render(DensityTest, {
            props: {
                plotArgs: {},
                densityArgs: { data: testData, x: 'x', y: 'y', bandwidth: 50, thresholds: 3 }
            }
        });
        const paths1 = c1.querySelectorAll('g[aria-label="density"] > path');
        const paths2 = c2.querySelectorAll('g[aria-label="density"] > path');
        // Both should render but may produce different numbers/shapes of paths
        const d1 = Array.from(paths1)
            .map((p) => p.getAttribute('d'))
            .join('');
        const d2 = Array.from(paths2)
            .map((p) => p.getAttribute('d'))
            .join('');
        expect(d1).not.toBe(d2);
    });

    it('does not poison the shared y scale when y extent is entirely invalid', () => {
        const { container } = render(DensitySharedScaleTest);

        const points = container.querySelectorAll('circle.shared-scale-point');
        expect(points).toHaveLength(2);

        for (const point of points) {
            const y = Number(point.getAttribute('data-y'));
            expect(Number.isFinite(y)).toBe(true);
            expect(y).toBeGreaterThanOrEqual(0);
            expect(y).toBeLessThanOrEqual(200);
        }
    });
});
