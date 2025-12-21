import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import DotTest from './dot.test.svelte';
import { getTranslate } from './utils';

describe('Facet padding', () => {
    it('uses fy padding to space vertical facets', () => {
        const { container } = render(DotTest, {
            props: {
                plotArgs: {
                    width: 200,
                    height: 200,
                    margin: 0,
                    axes: false,
                    x: { domain: [0, 1] },
                    y: { domain: [0, 1] },
                    fy: { domain: ['A', 'B'], padding: 0 }
                },
                dotArgs: {
                    data: [
                        { x: 0, y: 0, group: 'A' },
                        { x: 1, y: 1, group: 'B' }
                    ],
                    x: 'x',
                    y: 'y',
                    fy: 'group'
                }
            }
        });

        const facets = container.querySelectorAll('g.facet') as NodeListOf<SVGGElement>;
        expect(facets.length).toBe(2);

        const translateY = Array.from(facets).map((facet) => getTranslate(facet)[1]);
        const rectHeight = Number(
            (facets[0].querySelector('rect') as SVGRectElement).getAttribute('height')
        );

        expect(translateY[1] - translateY[0] - rectHeight).toBeCloseTo(0, 5);
    });

    it('uses fx padding to space horizontal facets', () => {
        const { container } = render(DotTest, {
            props: {
                plotArgs: {
                    width: 200,
                    height: 200,
                    margin: 0,
                    axes: false,
                    x: { domain: [0, 1] },
                    y: { domain: [0, 1] },
                    fx: { domain: ['A', 'B'], padding: 0 }
                },
                dotArgs: {
                    data: [
                        { x: 0, y: 0, group: 'A' },
                        { x: 1, y: 1, group: 'B' }
                    ],
                    x: 'x',
                    y: 'y',
                    fx: 'group'
                }
            }
        });

        const facets = container.querySelectorAll('g.facet') as NodeListOf<SVGGElement>;
        expect(facets.length).toBe(2);

        const translateX = Array.from(facets).map((facet) => getTranslate(facet)[0]);
        const rectWidth = Number(
            (facets[0].querySelector('rect') as SVGRectElement).getAttribute('width')
        );

        expect(translateX[1] - translateX[0] - rectWidth).toBeCloseTo(0, 5);
    });
});
