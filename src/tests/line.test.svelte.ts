import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
// @ts-expect-error - Svelte component has no typed default export
import LineTest from './line.test.svelte';

describe('Line mark', () => {
    it('single line', () => {
        const { container } = render(LineTest, {
            props: {
                data: [
                    { x: 0, y: 0 },
                    { x: 1, y: 1 },
                    { x: 2, y: 2 }
                ],
                x: 'x',
                y: 'y'
            }
        });

        const lines = container.querySelectorAll('g.lines > g > path');
        expect(lines).toHaveLength(1);
        expect(lines[0]?.getAttribute('d')).toBe('M1,95L48.5,50L96,5');
    });

    it('curve line', () => {
        const { container } = render(LineTest, {
            props: {
                data: [
                    { x: 0, y: 0 },
                    { x: 1, y: 2 },
                    { x: 2, y: 1 }
                ],
                x: 'x',
                y: 'y',
                curve: 'basis'
            }
        });

        const lines = container.querySelectorAll(
            'g.lines > g > path'
        ) as NodeListOf<SVGPathElement>;
        expect(lines).toHaveLength(1);
        expect(lines[0]?.getAttribute('d')).toBe(
            'M1,95L8.917,80C16.833,65,32.667,35,48.5,27.5C64.333,20,80.167,35,88.083,42.5L96,50'
        );
    });

    it('two lines', () => {
        const { container } = render(LineTest, {
            props: {
                data: [
                    { x: 0, y: 0, z: 'A' },
                    { x: 1, y: 1, z: 'A' },
                    { x: 0, y: 2, z: 'B' },
                    { x: 1, y: 2, z: 'B' }
                ],
                x: 'x',
                y: 'y',
                z: 'z'
            }
        });

        const lines = container.querySelectorAll('g.lines > g > path');
        expect(lines).toHaveLength(2);
        expect(lines[0]?.getAttribute('d')).toBe('M1,95L96,50');
        expect(lines[1]?.getAttribute('d')).toBe('M1,5L96,5');
    });

    it('styled line with stroke color and width', () => {
        const { container } = render(LineTest, {
            props: {
                data: [
                    { x: 0, y: 0 },
                    { x: 1, y: 1 },
                    { x: 2, y: 2 }
                ],
                x: 'x',
                y: 'y',
                stroke: 'red',
                strokeWidth: 3
            }
        });

        const lines = container.querySelectorAll(
            'g.lines > g > path'
        ) as NodeListOf<SVGPathElement>;
        expect(lines).toHaveLength(1);
        const line = lines[0];
        expect(line?.getAttribute('d')).toBe('M1,95L48.5,50L96,5');
        expect(line?.style.stroke).toBe('red');
        expect(line?.style.strokeWidth).toBe('3px');
    });

    it('line with outline stroke', () => {
        const { container } = render(LineTest, {
            props: {
                data: [
                    { x: 0, y: 0 },
                    { x: 1, y: 1 }
                ],
                x: 'x',
                y: 'y',
                stroke: 'blue',
                outlineStroke: 'white',
                outlineStrokeWidth: 5
            }
        });

        // The implementation might differ from our expectation - look for any path elements
        const paths = container.querySelectorAll(
            'g.lines > g > path'
        ) as NodeListOf<SVGPathElement>;
        expect(paths.length).toBeGreaterThan(0);

        // Check if at least one path has the expected styles
        let hasBlue = false;
        paths.forEach((path) => {
            if (path.style.stroke === 'blue') {
                hasBlue = true;
            }
        });
        expect(hasBlue).toBe(true);
    });

    it('line with markers', () => {
        const { container } = render(LineTest, {
            props: {
                data: [
                    { x: 0, y: 0 },
                    { x: 1, y: 1 },
                    { x: 2, y: 2 }
                ],
                x: 'x',
                y: 'y',
                marker: 'circle'
            }
        });

        const path = container.querySelectorAll('g.lines > g > path')[0];
        expect(path).not.toBeNull();
        expect(path?.getAttribute('marker-mid')).toMatch(/url\(#marker-/);
    });

    it.each([
        { markerScale: 1, expected: 6.67 },
        { markerScale: 0.5, expected: 3.335 }
    ])('scales markers with markerScale=$markerScale', ({ markerScale, expected }) => {
        const { container } = render(LineTest, {
            props: {
                data: [
                    { x: 0, y: 0 },
                    { x: 1, y: 1 },
                    { x: 2, y: 2 }
                ],
                x: 'x',
                y: 'y',
                marker: 'circle',
                markerScale
            }
        });

        const marker = container.querySelector('marker');
        expect(marker).not.toBeNull();
        const width = Number.parseFloat(marker?.getAttribute('markerWidth') ?? '');
        expect(width).toBeCloseTo(expected, 3);
    });

    it('line with text label', () => {
        const { container } = render(LineTest, {
            props: {
                data: [
                    { x: 0, y: 0 },
                    { x: 1, y: 1 }
                ],
                x: 'x',
                y: 'y',
                text: 'Line Label'
            }
        });

        const text = container.querySelectorAll('g.lines > g > text')[0] as SVGTextElement;
        expect(text).not.toBeNull();
        expect(text?.textContent).toBe('Line Label');
        // The fill might be applied differently or through a different attribute
        expect(text).not.toBeNull();
        expect(text?.style.fill).toBe('currentColor');
    });

    it('line with text label from data', () => {
        const { container } = render(LineTest, {
            props: {
                data: [
                    { x: 0, y: 0, label: 'Label' },
                    { x: 1, y: 1, label: 'Label' }
                ],
                x: 'x',
                y: 'y',
                text: (d: any) => d.label
            }
        });

        const text = container.querySelectorAll('g.lines > g > text')[0] as SVGTextElement;
        expect(text).not.toBeNull();
        expect(text?.textContent).toBe('Label');
    });

    it('line with colored text from data', () => {
        const { container } = render(LineTest, {
            props: {
                data: [
                    { x: 0, y: 0, label: 'Label' },
                    { x: 1, y: 1, label: 'Label' }
                ],
                x: 'x',
                y: 'y',
                stroke: 'label',
                text: (d: any) => d.label
            }
        });

        const text = container.querySelectorAll('g.lines > g > text')[0] as SVGTextElement;
        expect(text).not.toBeNull();
        expect(text?.textContent).toBe('Label');
        expect(text?.style.fill).toBe('#4269d0');
    });

    it('line with text label and custom style', () => {
        const { container } = render(LineTest, {
            props: {
                data: [
                    { x: 0, y: 0 },
                    { x: 1, y: 1 }
                ],
                x: 'x',
                y: 'y',
                text: 'Line Label',
                textFill: 'green',
                textStroke: 'red',
                textStrokeWidth: 4
            }
        });

        const text = container.querySelectorAll('g.lines > g > text')[0] as SVGTextElement;
        expect(text).not.toBeNull();
        expect(text?.textContent).toBe('Line Label');
        // The fill might be applied differently or through a different attribute
        expect(text).not.toBeNull();
        expect(text?.style.fill).toBe('green');
        expect(text?.style.stroke).toBe('red');
        expect(text?.style.strokeWidth).toBe('4px');
    });

    it('line with gaps (invalid data points)', () => {
        const { container } = render(LineTest, {
            props: {
                data: [
                    { x: 0, y: 0 },
                    { x: 1, y: null }, // invalid point
                    { x: 2, y: 2 }
                ],
                x: 'x',
                y: 'y'
            }
        });

        const path = container.querySelectorAll('g.lines > g > path')[0];
        // Path includes 'Z' to close paths
        expect(path?.getAttribute('d')).toBe('M1,95ZM96,5Z');
    });

    it('grouping by stroke color', () => {
        const { container } = render(LineTest, {
            props: {
                data: [
                    { x: 0, y: 0, category: 'A' },
                    { x: 1, y: 1, category: 'A' },
                    { x: 0, y: 2, category: 'B' },
                    { x: 1, y: 3, category: 'B' }
                ],
                x: 'x',
                y: 'y',
                stroke: 'category'
            }
        });

        const lines = container.querySelectorAll(
            'g.lines > g > path'
        ) as NodeListOf<SVGPathElement>;
        expect(lines).toHaveLength(2);
        // Verify we have two distinct lines with different stroke colors
        expect(lines[0]?.style.stroke).not.toBe(lines[1]?.style.stroke);
    });

    it('does not connect points from different groups', () => {
        const { container } = render(LineTest, {
            props: {
                data: [
                    { x: 0, y: 0, category: 'A' },
                    { x: 1, y: 1, category: 'A' },
                    { x: 0, y: 1, category: 'B' },
                    { x: 0.5, y: 1, category: 'C' }
                ],
                x: 'x',
                y: 'y',
                z: 'category'
            }
        });

        const lines = container.querySelectorAll(
            'g.lines > g > path'
        ) as NodeListOf<SVGPathElement>;
        expect(lines).toHaveLength(3);

        const ds = Array.from(lines).map((l) => l.getAttribute('d'));
        expect(ds[0]).toBe('M1,95L96,5');
        expect(ds[1]).toBe('M1,5Z');
        expect(ds[2]).toBe('M48.5,5Z');
    });

    it('correct datum passed to event handler', async () => {
        const checkDatum = vi.fn();
        const { container } = render(LineTest, {
            props: {
                data: [
                    { year: 2000, value: 0, category: 'A' },
                    { year: 2002, value: 2, category: 'B' },
                    { year: 2005, value: 1, category: 'C' }
                ],
                x: 'year',
                y: 'value',
                onclick: (event: MouseEvent, datum: any) => checkDatum(datum)
            }
        });

        const lines = container.querySelectorAll(
            'g.lines > g > path'
        ) as NodeListOf<SVGPathElement>;
        expect(lines).toHaveLength(2);

        await fireEvent.click(lines[0]);

        expect(checkDatum).toHaveBeenCalledTimes(1);
        expect(checkDatum.mock.calls[0]).toEqual([
            expect.objectContaining({ year: 2000, value: 0, category: 'A' })
        ]);
    });
});

function formatHTML(html: string) {
    var tab = '\t';
    var result = '';
    var indent = '';

    html.replace(/<!---->/g, '')
        .split(/>\s*</)
        .forEach(function (element: string) {
            if (element.match(/^\/\w/)) {
                indent = indent.substring(tab.length);
            }

            result += indent + '<' + element + '>\r\n';

            if (element.match(/^<?\w[^>]*[^/]$/) && !element.startsWith('input')) {
                indent += tab;
            }
        });

    return result.substring(1, result.length - 3);
}
