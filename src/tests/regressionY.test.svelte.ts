import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
// @ts-ignore - tsc in lint:types does not see default export for .svelte test component
import RegressionYTest from './regressionY.test.svelte';

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

describe('RegressionY mark', () => {
    it('renders linear regression line', () => {
        const { container } = render(RegressionYTest, {
            props: {
                data: linearData,
                x: 'x',
                y: 'y',
                type: 'linear'
            }
        });

        const groups = container.querySelectorAll('g[class*="regression-x"]');
        expect(groups.length).toBeGreaterThanOrEqual(1);

        const paths = groups[0].querySelectorAll('g.lines path');
        expect(paths.length).toBeGreaterThanOrEqual(1);
    });

    it('regression line path has valid d attribute', () => {
        const { container } = render(RegressionYTest, {
            props: {
                data: linearData,
                x: 'x',
                y: 'y'
            }
        });

        const paths = container.querySelectorAll('g[class*="regression-x"] g.lines path');
        expect(paths.length).toBeGreaterThanOrEqual(1);

        const d = paths[0].getAttribute('d');
        expect(d).toBeTruthy();
        expect(d).toMatch(/^M/);
    });

    it('renders confidence band by default', () => {
        const { container } = render(RegressionYTest, {
            props: {
                data: linearData,
                x: 'x',
                y: 'y'
            }
        });

        const group = container.querySelector('g[class*="regression-x"]');
        expect(group).not.toBeNull();

        const areaPaths = group!.querySelectorAll('path.area');
        expect(areaPaths.length).toBeGreaterThanOrEqual(1);
    });

    it('does not render confidence band for loess', () => {
        const { container } = render(RegressionYTest, {
            props: {
                data: linearData,
                x: 'x',
                y: 'y',
                type: 'loess'
            }
        });

        const group = container.querySelector('g[class*="regression-x"]');
        expect(group).not.toBeNull();

        // loess should still render a line
        const linePaths = group!.querySelectorAll('g.lines path');
        expect(linePaths.length).toBeGreaterThanOrEqual(1);

        // but no confidence band (loess has no predict method)
        const areaPaths = group!.querySelectorAll('path.area');
        expect(areaPaths.length).toBe(0);
    });

    it('applies custom stroke color', () => {
        const { container } = render(RegressionYTest, {
            props: {
                data: linearData,
                x: 'x',
                y: 'y',
                stroke: 'red'
            }
        });

        const paths = container.querySelectorAll('g[class*="regression-x"] g.lines path');
        expect(paths.length).toBeGreaterThanOrEqual(1);

        const path = paths[0] as SVGElement;
        expect(path.style.stroke).toBe('red');
    });

    it('groups regression lines by stroke', () => {
        const { container } = render(RegressionYTest, {
            props: {
                data: groupedData,
                x: 'x',
                y: 'y',
                stroke: 'cat'
            }
        });

        const groups = container.querySelectorAll('g[class*="regression-x"]');
        expect(groups.length).toBe(2);

        // each group should have a line path
        for (const group of groups) {
            const paths = group.querySelectorAll('g.lines path');
            expect(paths.length).toBeGreaterThanOrEqual(1);
        }

        // different groups should have different stroke colors
        const stroke0 = (groups[0].querySelector('g.lines path') as SVGElement)?.style.stroke;
        const stroke1 = (groups[1].querySelector('g.lines path') as SVGElement)?.style.stroke;
        expect(stroke0).not.toBe(stroke1);
    });

    it('groups regression lines by z', () => {
        const { container } = render(RegressionYTest, {
            props: {
                data: groupedData,
                x: 'x',
                y: 'y',
                z: 'cat'
            }
        });

        const groups = container.querySelectorAll('g[class*="regression-x"]');
        expect(groups.length).toBe(2);
    });

    it('applies custom CSS class', () => {
        const { container } = render(RegressionYTest, {
            props: {
                data: linearData,
                x: 'x',
                y: 'y',
                class: 'custom'
            }
        });

        const groups = container.querySelectorAll('g[class*="regression-x"]');
        expect(groups.length).toBeGreaterThanOrEqual(1);

        const group = groups[0];
        expect(group.classList.contains('custom')).toBe(true);
    });

    it('renders quadratic regression', () => {
        const { container } = render(RegressionYTest, {
            props: {
                data: linearData,
                x: 'x',
                y: 'y',
                type: 'quad'
            }
        });

        const groups = container.querySelectorAll('g[class*="regression-x"]');
        expect(groups.length).toBeGreaterThanOrEqual(1);

        const paths = groups[0].querySelectorAll('g.lines path');
        expect(paths.length).toBeGreaterThanOrEqual(1);
    });

    it('handles empty data', () => {
        const { container } = render(RegressionYTest, {
            props: {
                data: [],
                x: 'x',
                y: 'y'
            }
        });

        const groups = container.querySelectorAll('g[class*="regression-x"]');
        expect(groups.length).toBe(0);

        const paths = container.querySelectorAll('g.lines path');
        expect(paths.length).toBe(0);
    });
});
