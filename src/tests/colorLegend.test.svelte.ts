import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import ColorLegendTest from './colorLegend.test.svelte';

const catData = [
    { x: 1, y: 1, cat: 'A' },
    { x: 2, y: 2, cat: 'B' },
    { x: 3, y: 3, cat: 'C' }
];

const numData = [
    { x: 1, y: 1, value: 10 },
    { x: 2, y: 2, value: 50 },
    { x: 3, y: 3, value: 100 }
];

describe('ColorLegend mark', () => {
    it('renders ordinal legend with correct item count', () => {
        const { container } = render(ColorLegendTest, {
            props: {
                plotArgs: { color: { legend: true } },
                dotArgs: { data: catData, x: 'x', y: 'y', fill: 'cat' }
            }
        });

        const items = container.querySelectorAll('.color-legend .item');
        expect(items.length).toBe(3);
    });

    it('ordinal legend displays correct labels', () => {
        const { container } = render(ColorLegendTest, {
            props: {
                plotArgs: { color: { legend: true } },
                dotArgs: { data: catData, x: 'x', y: 'y', fill: 'cat' }
            }
        });

        const labels = container.querySelectorAll('.color-legend .item-label');
        const labelTexts = Array.from(labels).map((el) => el.textContent);
        expect(labelTexts).toEqual(['A', 'B', 'C']);
    });

    it('ordinal swatches have distinct fill colors', () => {
        const { container } = render(ColorLegendTest, {
            props: {
                plotArgs: { color: { legend: true } },
                dotArgs: { data: catData, x: 'x', y: 'y', fill: 'cat' }
            }
        });

        const rects = container.querySelectorAll(
            '.color-legend .swatch rect'
        ) as NodeListOf<SVGRectElement>;
        expect(rects.length).toBe(3);

        const fills = Array.from(rects).map((r) => r.style.fill);
        const uniqueFills = new Set(fills);
        expect(uniqueFills.size).toBe(3);
    });

    it('renders symbol paths when fill and symbol use same accessor', () => {
        const { container } = render(ColorLegendTest, {
            props: {
                plotArgs: { color: { legend: true } },
                dotArgs: { data: catData, x: 'x', y: 'y', fill: 'cat', symbol: 'cat' }
            }
        });

        const paths = container.querySelectorAll('.color-legend .swatch path');
        expect(paths.length).toBe(3);

        // Should not have rect swatches when symbols are used
        const rects = container.querySelectorAll('.color-legend .swatch rect');
        expect(rects.length).toBe(0);
    });

    it('renders legend title when label is set', () => {
        const { container } = render(ColorLegendTest, {
            props: {
                plotArgs: { color: { legend: true, label: 'Category' } },
                dotArgs: { data: catData, x: 'x', y: 'y', fill: 'cat' }
            }
        });

        const title = container.querySelector('.color-legend .title');
        expect(title).not.toBeNull();
        expect(title!.textContent).toBe('Category');
    });

    it('does not render legend when no marks use color scale', () => {
        const { container } = render(ColorLegendTest, {
            props: {
                plotArgs: { color: { legend: true } },
                dotArgs: { data: catData, x: 'x', y: 'y', fill: 'steelblue' }
            }
        });

        const legend = container.querySelector('.color-legend');
        expect(legend).toBeNull();
    });

    it('renders continuous legend with gradient', () => {
        const { container } = render(ColorLegendTest, {
            props: {
                plotArgs: { color: { legend: true } },
                dotArgs: { data: numData, x: 'x', y: 'y', fill: 'value' }
            }
        });

        // Continuous legend renders a nested Plot containing SVG with linearGradient
        const legend = container.querySelector('.color-legend');
        expect(legend).not.toBeNull();

        // The nested Plot renders as a figure.svelteplot inside the legend
        const nestedPlot = legend!.querySelector('figure.svelteplot');
        expect(nestedPlot).not.toBeNull();

        const gradient = nestedPlot!.querySelector('linearGradient');
        expect(gradient).not.toBeNull();

        const stops = gradient!.querySelectorAll('stop');
        expect(stops.length).toBeGreaterThan(0);
    });

    it('renders single category with one item', () => {
        const singleCatData = [
            { x: 1, y: 1, cat: 'Only' },
            { x: 2, y: 2, cat: 'Only' }
        ];

        const { container } = render(ColorLegendTest, {
            props: {
                plotArgs: { color: { legend: true } },
                dotArgs: { data: singleCatData, x: 'x', y: 'y', fill: 'cat' }
            }
        });

        const items = container.querySelectorAll('.color-legend .item');
        expect(items.length).toBe(1);

        const label = container.querySelector('.color-legend .item-label');
        expect(label!.textContent).toBe('Only');
    });
});
