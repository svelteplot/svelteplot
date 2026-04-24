import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import DotTest from './dot.test.svelte';

const testData = [
    { x: 10, y: 20, category: 'A' },
    { x: 15, y: 25, category: 'B' },
    { x: 20, y: 15, category: null }
];

describe('Null facet values', () => {
    it('renders a facet column for null fx values', () => {
        const { container } = render(DotTest, {
            props: {
                plotArgs: {},
                dotArgs: {
                    data: testData,
                    x: 'x',
                    y: 'y',
                    fx: 'category'
                }
            }
        });
        const facets = container.querySelectorAll('g.facet');
        // Should have 3 facets: A, B, and null
        expect(facets.length).toBe(3);

        // All 3 dots should be rendered across the facets
        const totalDots = container.querySelectorAll('g.dot > path').length;
        expect(totalDots).toBe(3);
    });
});
