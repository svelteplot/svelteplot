import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import DotTest from './dot.test.svelte';
import { tick } from 'svelte';

const testData = [
    { x: 10, y: 20, category: 'A', value: 5 },
    { x: 15, y: 25, category: 'A', value: 10 },
    { x: 15, y: 15, category: 'B', value: 10 },
    { x: 10, y: 15, category: 'B', value: 10 },
    { x: 15, y: 20, category: 'C', value: 10 }
];

describe('Faceted dot mark', () => {
    it('renders dots in 3 facets', () => {
        const { container } = render(DotTest, {
            props: {
                plotArgs: {},
                dotArgs: {
                    data: testData,
                    x: 'x',
                    y: 'y',
                    fx: 'category',
                    r: 'value'
                }
            }
        });
        const facets = container.querySelectorAll('g.facet');
        expect(facets.length).toBe(3); // 3 unique categories: A, B, C
        const dotsInFacets = Array.from(facets).map(
            (facet) => facet.querySelectorAll('g.dot > path').length
        );
        expect(dotsInFacets).toEqual([2, 2, 1]); // A has 2, B has 2, C has 1

        const dots = container.querySelectorAll('g.dot > path');
        expect(dots.length).toBe(5);
    });

    it('hides one facet after data changes', async () => {
        const props = $state({
            plotArgs: {},
            dotArgs: {
                data: testData,
                x: 'x',
                y: 'y',
                fx: 'category',
                r: 'value'
            }
        });
        const { container } = render(DotTest, { props });
        const facets = container.querySelectorAll('g.facet');
        expect(facets.length).toBe(3); // 3 unique categories: A, B, C

        props.dotArgs.data = testData.filter((d) => d.category !== 'C');
        await tick();

        const facets2 = container.querySelectorAll('g.facet');
        expect(facets2.length).toBe(2); // 3 unique categories: A, B, C
    });
});
