import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import SymbolLegendTest from './symbolLegend.fixture.svelte';

const catData = [
    { x: 1, y: 1, cat: 'A' },
    { x: 2, y: 2, cat: 'B' },
    { x: 3, y: 3, cat: 'C' }
];

const mixedData = [
    { x: 1, y: 1, cat: 'A', group: 'X' },
    { x: 2, y: 2, cat: 'B', group: 'Y' },
    { x: 3, y: 3, cat: 'C', group: 'Z' }
];

describe('SymbolLegend mark', () => {
    it('does not render when no marks use color scale', async () => {
        const { container } = render(SymbolLegendTest, {
            props: {
                plotArgs: { symbol: { legend: true } },
                dotArgs: { data: catData, x: 'x', y: 'y' }
            }
        });
        await tick();
        expect(container.querySelector('.symbol-legend')).toBeNull();
    });

    it('renders symbol legend when active', async () => {
        const { container } = render(SymbolLegendTest, {
            props: {
                plotArgs: { symbol: { legend: true } },
                dotArgs: { data: catData, x: 'x', y: 'y', fill: 'cat', symbol: 'cat' }
            }
        });
        await tick();
        expect(container.querySelector('.symbol-legend')).not.toBeNull();
    });

    it('renders one item per domain value', async () => {
        const { container } = render(SymbolLegendTest, {
            props: {
                plotArgs: { symbol: { legend: true } },
                dotArgs: { data: catData, x: 'x', y: 'y', fill: 'cat', symbol: 'cat' }
            }
        });
        await tick();
        const items = container.querySelectorAll('.symbol-legend .item');
        expect(items).toHaveLength(3);
    });

    it('displays correct label text', async () => {
        const { container } = render(SymbolLegendTest, {
            props: {
                plotArgs: { symbol: { legend: true } },
                dotArgs: { data: catData, x: 'x', y: 'y', fill: 'cat', symbol: 'cat' }
            }
        });
        await tick();
        const labels = container.querySelectorAll('.symbol-legend .item-label');
        const texts = Array.from(labels).map((el) => el.textContent);
        expect(texts).toEqual(['A', 'B', 'C']);
    });

    it('each swatch contains an SVG path with valid d attribute', async () => {
        const { container } = render(SymbolLegendTest, {
            props: {
                plotArgs: { symbol: { legend: true } },
                dotArgs: { data: catData, x: 'x', y: 'y', fill: 'cat', symbol: 'cat' }
            }
        });
        await tick();
        const paths = container.querySelectorAll('.symbol-legend .swatch svg path');
        expect(paths).toHaveLength(3);
        paths.forEach((path) => {
            expect(path.getAttribute('d')).toBeTruthy();
        });
    });

    it('produces distinct symbol shapes for different categories', async () => {
        const { container } = render(SymbolLegendTest, {
            props: {
                plotArgs: { symbol: { legend: true } },
                dotArgs: { data: catData, x: 'x', y: 'y', fill: 'cat', symbol: 'cat' }
            }
        });
        await tick();
        const paths = container.querySelectorAll('.symbol-legend .swatch svg path');
        const dValues = new Set(Array.from(paths).map((p) => p.getAttribute('d')));
        expect(dValues.size).toBe(3);
    });

    it('uses scale colors when color and symbol are redundant (filled)', async () => {
        const { container } = render(SymbolLegendTest, {
            props: {
                plotArgs: { symbol: { legend: true } },
                dotArgs: { data: catData, x: 'x', y: 'y', fill: 'cat', symbol: 'cat' }
            }
        });
        await tick();
        const paths = container.querySelectorAll('.symbol-legend .swatch svg path');
        expect(paths).toHaveLength(3);

        const expectedColors = ['#4269d0', '#efb118', '#ff725c'];
        paths.forEach((path, i) => {
            const el = path as SVGPathElement;
            expect(el.style.fill).toBe(expectedColors[i]);
            expect(el.style.stroke).toBeFalsy();
        });
    });

    it('uses currentColor when color and symbol are not redundant', async () => {
        const { container } = render(SymbolLegendTest, {
            props: {
                plotArgs: { symbol: { legend: true } },
                dotArgs: {
                    data: mixedData,
                    x: 'x',
                    y: 'y',
                    fill: 'cat',
                    symbol: 'group'
                }
            }
        });
        await tick();
        const paths = container.querySelectorAll('.symbol-legend .swatch svg path');
        expect(paths).toHaveLength(3);
        paths.forEach((path) => {
            const el = path as SVGPathElement;
            expect(el.style.fill).toBe('currentColor');
        });
    });

    it('uses stroke (not fill) when Dot marks are not filled', async () => {
        const { container } = render(SymbolLegendTest, {
            props: {
                plotArgs: { symbol: { legend: true } },
                dotArgs: { data: catData, x: 'x', y: 'y', stroke: 'cat', symbol: 'cat' }
            }
        });
        await tick();
        const paths = container.querySelectorAll('.symbol-legend .swatch svg path');
        expect(paths).toHaveLength(3);

        const expectedColors = ['#4269d0', '#efb118', '#ff725c'];
        paths.forEach((path, i) => {
            const el = path as SVGPathElement;
            expect(el.style.fill).toBe('none');
            expect(el.style.stroke).toBe(expectedColors[i]);
        });
    });
});
