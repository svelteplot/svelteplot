import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import LinkTest from './link.test.svelte';

const twoLinks = [
    { x1: 0, y1: 0, x2: 1, y2: 1 },
    { x1: 0, y1: 1, x2: 1, y2: 0 }
];

const sortData = [
    { id: 'red', from: 1, to: 2 },
    { id: 'green', from: 3, to: 5 },
    { id: 'blue', from: 2, to: 4 }
];

describe('Link mark', () => {
    it.each([
        { markerScale: 1, expected: 6.67 },
        { markerScale: 0.5, expected: 3.335 }
    ])('scales markers with markerScale=$markerScale', ({ markerScale, expected }) => {
        const { container } = render(LinkTest, {
            props: {
                data: twoLinks,
                x1: 'x1',
                y1: 'y1',
                x2: 'x2',
                y2: 'y2',
                marker: 'circle',
                markerScale
            }
        });

        const marker = container.querySelector('marker');
        expect(marker).not.toBeNull();
        const width = Number.parseFloat(marker?.getAttribute('markerWidth') ?? '');
        expect(width).toBeCloseTo(expected, 3);
    });

    it('renders a single link path', () => {
        const { container } = render(LinkTest, {
            props: {
                data: [{ x1: 0, y1: 0, x2: 1, y2: 1 }],
                x1: 'x1',
                y1: 'y1',
                x2: 'x2',
                y2: 'y2'
            }
        });

        const paths = container.querySelectorAll('g.link > g > path');
        expect(paths.length).toBeGreaterThanOrEqual(1);

        const d = paths[0]?.getAttribute('d');
        expect(d).toContain('M');
        expect(d).toContain('L');
    });

    it('renders one path per datum', () => {
        const { container } = render(LinkTest, {
            props: {
                data: twoLinks,
                x1: 'x1',
                y1: 'y1',
                x2: 'x2',
                y2: 'y2'
            }
        });

        const paths = container.querySelectorAll('g.link > g > path');
        expect(paths.length).toBeGreaterThanOrEqual(2);

        const d0 = paths[0]?.getAttribute('d');
        const d1 = paths[1]?.getAttribute('d');
        expect(d0).not.toBe(d1);
    });

    it('applies default stroke and strokeWidth', () => {
        const { container } = render(LinkTest, {
            props: {
                data: [{ x1: 0, y1: 0, x2: 1, y2: 1 }],
                x1: 'x1',
                y1: 'y1',
                x2: 'x2',
                y2: 'y2'
            }
        });

        const paths = container.querySelectorAll('g.link > g > path');
        expect(paths.length).toBeGreaterThanOrEqual(1);

        const path = paths[0] as SVGElement;
        expect(path.style.stroke).toBe('currentColor');
        expect(path.style.strokeWidth).toBe('1.6px');
    });

    it('applies custom stroke and strokeWidth', () => {
        const { container } = render(LinkTest, {
            props: {
                data: [{ x1: 0, y1: 0, x2: 1, y2: 1 }],
                x1: 'x1',
                y1: 'y1',
                x2: 'x2',
                y2: 'y2',
                stroke: 'red',
                strokeWidth: 3
            }
        });

        const paths = container.querySelectorAll('g.link > g > path');
        expect(paths.length).toBeGreaterThanOrEqual(1);

        const path = paths[0] as SVGElement;
        expect(path.style.stroke).toBe('red');
        expect(path.style.strokeWidth).toBe('3px');
    });

    it('maps stroke to data channel', () => {
        const { container } = render(LinkTest, {
            props: {
                data: [
                    { x1: 0, y1: 0, x2: 1, y2: 1, category: 'A' },
                    { x1: 0, y1: 1, x2: 1, y2: 0, category: 'B' }
                ],
                x1: 'x1',
                y1: 'y1',
                x2: 'x2',
                y2: 'y2',
                stroke: 'category'
            }
        });

        const paths = container.querySelectorAll('g.link > g > path');
        expect(paths.length).toBe(2);

        const stroke0 = (paths[0] as SVGElement).style.stroke;
        const stroke1 = (paths[1] as SVGElement).style.stroke;
        expect(stroke0).not.toBe(stroke1);
    });

    it('sorts links by specified channel', () => {
        const { container } = render(LinkTest, {
            props: {
                data: sortData,
                x1: 'id',
                x2: 'id',
                y1: 'from',
                y2: 'to',
                stroke: 'id',
                sort: { channel: 'y1' }
            }
        });

        const paths = container.querySelectorAll('g.link > g > path');
        expect(paths.length).toBe(sortData.length);

        const strokes = Array.from(paths).map((p) => (p as SVGElement).style.stroke);
        expect(strokes).toEqual(['red', 'blue', 'green']);
    });

    it('applies custom CSS class', () => {
        const { container } = render(LinkTest, {
            props: {
                data: [{ x1: 0, y1: 0, x2: 1, y2: 1 }],
                x1: 'x1',
                y1: 'y1',
                x2: 'x2',
                y2: 'y2',
                class: 'custom-links'
            }
        });

        const groups = container.querySelectorAll('g.link.custom-links');
        expect(groups.length).toBeGreaterThanOrEqual(1);
    });

    it('applies named curve', () => {
        const { container } = render(LinkTest, {
            props: {
                data: [{ x1: 0, y1: 0, x2: 1, y2: 1 }],
                x1: 'x1',
                y1: 'y1',
                x2: 'x2',
                y2: 'y2',
                curve: 'bump-x'
            }
        });

        const paths = container.querySelectorAll('g.link > g > path');
        expect(paths.length).toBeGreaterThanOrEqual(1);

        const d = paths[0]?.getAttribute('d');
        expect(d).toBeDefined();
        expect(d).toContain('C');
        expect(d).not.toContain('L');
    });

    it('renders text label along path', () => {
        const { container } = render(LinkTest, {
            props: {
                data: [{ x1: 0, y1: 0, x2: 2, y2: 2 }],
                x1: 'x1',
                y1: 'y1',
                x2: 'x2',
                y2: 'y2',
                text: 'Hello'
            }
        });

        const textPaths = container.querySelectorAll('g.link textPath');
        expect(textPaths.length).toBeGreaterThanOrEqual(1);
        expect(textPaths[0]?.textContent).toBe('Hello');

        // invisible text path should exist with stroke="none" and fill="none"
        const invisiblePaths = container.querySelectorAll('g.link path[id]');
        expect(invisiblePaths.length).toBeGreaterThanOrEqual(1);
        expect(invisiblePaths[0]?.getAttribute('stroke')).toBe('none');
        expect(invisiblePaths[0]?.getAttribute('fill')).toBe('none');
    });

    it('reverses text path for right-to-left links', () => {
        const { container } = render(LinkTest, {
            props: {
                data: [{ x1: 2, y1: 0, x2: 0, y2: 2 }],
                x1: 'x1',
                y1: 'y1',
                x2: 'x2',
                y2: 'y2',
                text: 'RTL Label'
            }
        });

        // main path (no id attribute) goes from pixel(x1=2) to pixel(x2=0)
        const allPaths = container.querySelectorAll('g.link > g > path');
        const mainPath = Array.from(allPaths).find((p) => !p.hasAttribute('id'));
        // invisible text path (has id) should be reversed for readability
        const textPathEl = Array.from(allPaths).find((p) => p.hasAttribute('id'));

        expect(mainPath).toBeDefined();
        expect(textPathEl).toBeDefined();

        const mainD = mainPath?.getAttribute('d') ?? '';
        const textD = textPathEl?.getAttribute('d') ?? '';

        // extract x coordinate from first M command
        const mainX = parseFloat(mainD.match(/M([\d.]+)/)?.[1] ?? '0');
        const textX = parseFloat(textD.match(/M([\d.]+)/)?.[1] ?? '0');

        // main path starts at higher x (right), text path starts at lower x (left)
        expect(mainX).toBeGreaterThan(textX);
    });

    it('handles empty data', () => {
        const { container } = render(LinkTest, {
            props: {
                data: [],
                x1: 'x1',
                y1: 'y1',
                x2: 'x2',
                y2: 'y2'
            }
        });

        const paths = container.querySelectorAll('g.link > g > path');
        expect(paths.length).toBe(0);
    });
});
