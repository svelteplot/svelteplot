import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
// @ts-ignore - tsc in lint:types does not see default export for .svelte test component
// @ts-expect-error - Svelte component has no typed default export
import RegressionXTest from './regressionX.test.svelte';

const linearData = [
    { x: 1, y: 2 },
    { x: 2, y: 4 },
    { x: 3, y: 5 },
    { x: 4, y: 8 },
    { x: 5, y: 10 }
];

const groupedData = [
    { x: 1, y: 2, cat: 'A' },
    { x: 2, y: 4, cat: 'A' },
    { x: 3, y: 6, cat: 'A' },
    { x: 1, y: 10, cat: 'B' },
    { x: 2, y: 8, cat: 'B' },
    { x: 3, y: 6, cat: 'B' }
];

describe('RegressionX mark', () => {
    it('renders linear regression with x as dependent', () => {
        const { container } = render(RegressionXTest, {
            props: {
                data: linearData,
                x: 'x',
                y: 'y'
            }
        });

        // RegressionX: dependent=x, so independent=y → class is regression-y
        const groups = container.querySelectorAll('g[class*="regression-y"]');
        expect(groups.length).toBeGreaterThanOrEqual(1);

        const paths = groups[0].querySelectorAll('g.lines path');
        expect(paths.length).toBeGreaterThanOrEqual(1);
    });

    it('renders confidence band', () => {
        const { container } = render(RegressionXTest, {
            props: {
                data: linearData,
                x: 'x',
                y: 'y'
            }
        });

        const group = container.querySelector('g[class*="regression-y"]');
        expect(group).not.toBeNull();

        const areaPaths = group!.querySelectorAll('path.area');
        expect(areaPaths.length).toBeGreaterThanOrEqual(1);
    });

    it('groups by stroke', () => {
        const { container } = render(RegressionXTest, {
            props: {
                data: groupedData,
                x: 'x',
                y: 'y',
                stroke: 'cat'
            }
        });

        const groups = container.querySelectorAll('g[class*="regression-y"]');
        expect(groups.length).toBe(2);
    });

    it('handles empty data', () => {
        const { container } = render(RegressionXTest, {
            props: {
                data: [],
                x: 'x',
                y: 'y'
            }
        });

        const groups = container.querySelectorAll('g[class*="regression-y"]');
        expect(groups.length).toBe(0);
    });
});
