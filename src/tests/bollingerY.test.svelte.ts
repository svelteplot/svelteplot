import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
// @ts-ignore - svelte-check errors on .svelte imports, tsc does not
import BollingerYTest from './bollingerY.test.svelte';

const data = [
    { x: 1, y: 10 },
    { x: 2, y: 20 },
    { x: 3, y: 15 },
    { x: 4, y: 25 },
    { x: 5, y: 30 },
    { x: 6, y: 22 },
    { x: 7, y: 35 },
    { x: 8, y: 28 },
    { x: 9, y: 40 },
    { x: 10, y: 33 }
];

describe('BollingerY mark', () => {
    it('renders moving average line', () => {
        const { container } = render(BollingerYTest, {
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
        const { container } = render(BollingerYTest, {
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
        const { container } = render(BollingerYTest, {
            props: { data, x: 'x', y: 'y', n: 3, stroke: 'red' }
        });

        const paths = container.querySelectorAll('g.bollinger g.lines path');
        expect(paths.length).toBeGreaterThanOrEqual(1);

        const path = paths[0] as SVGElement;
        expect(path.style.stroke).toBe('red');
    });

    it('applies custom fill color', () => {
        const { container } = render(BollingerYTest, {
            props: { data, x: 'x', y: 'y', n: 3, fill: 'blue' }
        });

        const areaPaths = container.querySelectorAll('g.bollinger path.area');
        expect(areaPaths.length).toBeGreaterThanOrEqual(1);

        const path = areaPaths[0] as SVGElement;
        expect(path.style.fill).toBe('blue');
    });

    it('applies custom CSS class', () => {
        const { container } = render(BollingerYTest, {
            props: { data, x: 'x', y: 'y', n: 3, class: 'custom' }
        });

        const group = container.querySelector('g.bollinger');
        expect(group).not.toBeNull();
        expect(group!.classList.contains('custom')).toBe(true);
    });

    it('respects n parameter', () => {
        const { container } = render(BollingerYTest, {
            props: { data, x: 'x', y: 'y', n: 5 }
        });

        const paths = container.querySelectorAll('g.bollinger g.lines path');
        expect(paths.length).toBeGreaterThanOrEqual(1);

        const areaPaths = container.querySelectorAll('g.bollinger path.area');
        expect(areaPaths.length).toBeGreaterThanOrEqual(1);
    });

    it('respects k parameter', () => {
        const { container } = render(BollingerYTest, {
            props: { data, x: 'x', y: 'y', n: 3, k: 1 }
        });

        const areaPaths = container.querySelectorAll('g.bollinger path.area');
        expect(areaPaths.length).toBeGreaterThanOrEqual(1);
    });

    it('handles empty data', () => {
        const { container } = render(BollingerYTest, {
            props: { data: [], x: 'x', y: 'y', n: 3 }
        });

        const paths = container.querySelectorAll('g.bollinger g.lines path');
        expect(paths.length).toBe(0);

        const areaPaths = container.querySelectorAll('g.bollinger path.area');
        expect(areaPaths.length).toBe(0);
    });
});
