import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
// @ts-ignore - svelte-check errors on .svelte imports, tsc does not
import DelaunayLinkTest from './delaunayLink.test.svelte';

const triangle = [
    { x: 0, y: 0, group: 'A' },
    { x: 1, y: 0, group: 'A' },
    { x: 0.5, y: 1, group: 'B' }
];

const quad = [
    { x: 0, y: 0, group: 'A' },
    { x: 1, y: 0, group: 'A' },
    { x: 1, y: 1, group: 'B' },
    { x: 0, y: 1, group: 'B' }
];

describe('DelaunayLink mark', () => {
    it('renders multiple edge paths', () => {
        const { container } = render(DelaunayLinkTest, {
            props: {
                linkArgs: {
                    data: triangle,
                    x: 'x',
                    y: 'y'
                }
            }
        });

        // 3 points form a triangle → 3 edges
        const paths = container.querySelectorAll('g.delaunay-link path');
        expect(paths.length).toBe(3);
    });

    it('each edge has a valid M...L path', () => {
        const { container } = render(DelaunayLinkTest, {
            props: {
                linkArgs: {
                    data: triangle,
                    x: 'x',
                    y: 'y'
                }
            }
        });

        const paths = container.querySelectorAll('g.delaunay-link path');
        for (const path of paths) {
            const d = path.getAttribute('d');
            expect(d).toMatch(/^M[\d.,-]+L[\d.,-]+$/);
        }
    });

    it('each edge is unique', () => {
        const { container } = render(DelaunayLinkTest, {
            props: {
                linkArgs: {
                    data: quad,
                    x: 'x',
                    y: 'y'
                }
            }
        });

        const paths = container.querySelectorAll('g.delaunay-link path');
        const dValues = Array.from(paths).map((p) => p.getAttribute('d'));
        const unique = new Set(dValues);
        expect(unique.size).toBe(paths.length);
    });

    it('applies default stroke and no fill', () => {
        const { container } = render(DelaunayLinkTest, {
            props: {
                linkArgs: {
                    data: triangle,
                    x: 'x',
                    y: 'y'
                }
            }
        });

        const path = container.querySelector('g.delaunay-link path') as SVGElement;
        expect(path.style.stroke).toBe('currentColor');
        expect(path.style.fill).toBe('none');
    });

    it('applies custom stroke and strokeWidth', () => {
        const { container } = render(DelaunayLinkTest, {
            props: {
                linkArgs: {
                    data: triangle,
                    x: 'x',
                    y: 'y',
                    stroke: 'red',
                    strokeWidth: 3
                }
            }
        });

        const path = container.querySelector('g.delaunay-link path') as SVGElement;
        expect(path.style.stroke).toBe('red');
        expect(path.style.strokeWidth).toBe('3px');
    });

    it('maps stroke to data channel', () => {
        const { container } = render(DelaunayLinkTest, {
            props: {
                linkArgs: {
                    data: quad,
                    x: 'x',
                    y: 'y',
                    stroke: 'group'
                }
            }
        });

        const paths = container.querySelectorAll('g.delaunay-link path');
        const strokes = Array.from(paths).map((p) => (p as SVGElement).style.stroke);
        // Edges from group A and B sources should have different colors
        const unique = new Set(strokes);
        expect(unique.size).toBeGreaterThan(1);
    });

    it('applies custom CSS class', () => {
        const { container } = render(DelaunayLinkTest, {
            props: {
                linkArgs: {
                    data: triangle,
                    x: 'x',
                    y: 'y',
                    class: 'my-links'
                }
            }
        });

        expect(container.querySelector('g.my-links')).not.toBeNull();
    });

    it('handles empty data', () => {
        const { container } = render(DelaunayLinkTest, {
            props: {
                linkArgs: { data: [], x: 'x', y: 'y' }
            }
        });

        const paths = container.querySelectorAll('g.delaunay-link path');
        expect(paths.length).toBe(0);
    });

    it('handles single data point', () => {
        const { container } = render(DelaunayLinkTest, {
            props: {
                linkArgs: {
                    data: [{ x: 0.5, y: 0.5 }],
                    x: 'x',
                    y: 'y'
                }
            }
        });

        const paths = container.querySelectorAll('g.delaunay-link path');
        expect(paths.length).toBe(0);
    });

    it('fires onclick with source datum', async () => {
        const handler = vi.fn();

        const { container } = render(DelaunayLinkTest, {
            props: {
                linkArgs: {
                    data: triangle,
                    x: 'x',
                    y: 'y',
                    onclick: (evt: Event, datum: unknown) => handler(datum)
                }
            }
        });

        const paths = container.querySelectorAll('g.delaunay-link path');
        expect(paths.length).toBeGreaterThan(0);

        await fireEvent.click(paths[0]);
        expect(handler).toHaveBeenCalledTimes(1);
        // Datum should be one of the triangle points
        const datum = handler.mock.calls[0][0];
        expect(datum).toHaveProperty('x');
        expect(datum).toHaveProperty('y');
    });

    it('sets role=button when onclick is provided', () => {
        const { container } = render(DelaunayLinkTest, {
            props: {
                linkArgs: {
                    data: triangle,
                    x: 'x',
                    y: 'y',
                    onclick: () => {}
                }
            }
        });

        const path = container.querySelector('g.delaunay-link path');
        expect(path?.getAttribute('role')).toBe('button');
    });

    it('renders with accessor functions', () => {
        const { container } = render(DelaunayLinkTest, {
            props: {
                linkArgs: {
                    data: triangle,
                    x: (d: (typeof triangle)[0]) => d.x,
                    y: (d: (typeof triangle)[0]) => d.y
                }
            }
        });

        const paths = container.querySelectorAll('g.delaunay-link path');
        expect(paths.length).toBe(3);
    });
});
