import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
// @ts-ignore - svelte-check errors on .svelte imports, tsc does not
import BollingerXTest from './bollingerX.test.svelte';

const data = [
    { x: 10, y: 1 },
    { x: 20, y: 2 },
    { x: 15, y: 3 },
    { x: 25, y: 4 },
    { x: 30, y: 5 },
    { x: 22, y: 6 },
    { x: 35, y: 7 },
    { x: 28, y: 8 },
    { x: 40, y: 9 },
    { x: 33, y: 10 }
];

describe('BollingerX mark', () => {
    it('renders moving average line', () => {
        const { container } = render(BollingerXTest, {
            props: { data, x: 'x', y: 'y', n: 3 }
        });

        const group = container.querySelector('g.bollinger');
        expect(group).not.toBeNull();

        const paths = group!.querySelectorAll('g.lines path');
        expect(paths.length).toBeGreaterThanOrEqual(1);

        const d = paths[0].getAttribute('d');
        expect(d).toBeTruthy();
        expect(d).toMatch(/^M/);
    });

    it('renders volatility band', () => {
        const { container } = render(BollingerXTest, {
            props: { data, x: 'x', y: 'y', n: 3 }
        });

        const group = container.querySelector('g.bollinger');
        expect(group).not.toBeNull();

        const areaPaths = group!.querySelectorAll('path.area');
        expect(areaPaths.length).toBeGreaterThanOrEqual(1);

        const d = areaPaths[0].getAttribute('d');
        expect(d).toBeTruthy();
        expect(d).toMatch(/^M/);
    });

    it('applies custom stroke color', () => {
        const { container } = render(BollingerXTest, {
            props: { data, x: 'x', y: 'y', n: 3, stroke: 'red' }
        });

        const paths = container.querySelectorAll('g.bollinger g.lines path');
        expect(paths.length).toBeGreaterThanOrEqual(1);

        const path = paths[0] as SVGElement;
        expect(path.style.stroke).toBe('red');
    });

    it('applies custom fill color', () => {
        const { container } = render(BollingerXTest, {
            props: { data, x: 'x', y: 'y', n: 3, fill: 'blue' }
        });

        const areaPaths = container.querySelectorAll('g.bollinger path.area');
        expect(areaPaths.length).toBeGreaterThanOrEqual(1);

        const path = areaPaths[0] as SVGElement;
        expect(path.style.fill).toBe('blue');
    });

    it('applies custom CSS class', () => {
        const { container } = render(BollingerXTest, {
            props: { data, x: 'x', y: 'y', n: 3, class: 'custom' }
        });

        const group = container.querySelector('g.bollinger');
        expect(group).not.toBeNull();
        expect(group!.classList.contains('custom')).toBe(true);
    });

    it('respects n parameter', () => {
        const { container } = render(BollingerXTest, {
            props: { data, x: 'x', y: 'y', n: 5 }
        });

        const paths = container.querySelectorAll('g.bollinger g.lines path');
        expect(paths.length).toBeGreaterThanOrEqual(1);

        const areaPaths = container.querySelectorAll('g.bollinger path.area');
        expect(areaPaths.length).toBeGreaterThanOrEqual(1);
    });

    it('respects k parameter', () => {
        const { container } = render(BollingerXTest, {
            props: { data, x: 'x', y: 'y', n: 3, k: 1 }
        });

        const areaPaths = container.querySelectorAll('g.bollinger path.area');
        expect(areaPaths.length).toBeGreaterThanOrEqual(1);
    });

    it('handles empty data', () => {
        const { container } = render(BollingerXTest, {
            props: { data: [], x: 'x', y: 'y', n: 3 }
        });

        const paths = container.querySelectorAll('g.bollinger g.lines path');
        expect(paths.length).toBe(0);

        const areaPaths = container.querySelectorAll('g.bollinger path.area');
        expect(areaPaths.length).toBe(0);
    });
});
