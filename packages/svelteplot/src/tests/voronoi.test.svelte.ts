import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
// @ts-ignore - svelte-check errors on .svelte imports, tsc does not
import VoronoiTest from './voronoi.test.svelte';

const penguinLike = [
    { x: 0, y: 0, species: 'A' },
    { x: 1, y: 1, species: 'A' },
    { x: 0.5, y: 0.5, species: 'B' },
    { x: 0.2, y: 0.8, species: 'B' }
];

describe('Voronoi mark', () => {
    it('renders one cell path per data point', () => {
        const { container } = render(VoronoiTest, {
            props: {
                voronoiArgs: {
                    data: penguinLike,
                    x: 'x',
                    y: 'y'
                }
            }
        });

        const paths = container.querySelectorAll('g.voronoi path');
        expect(paths.length).toBe(penguinLike.length);
    });

    it('each cell has a distinct path', () => {
        const { container } = render(VoronoiTest, {
            props: {
                voronoiArgs: {
                    data: penguinLike,
                    x: 'x',
                    y: 'y'
                }
            }
        });

        const paths = container.querySelectorAll('g.voronoi path');
        const dValues = Array.from(paths).map((p) => p.getAttribute('d'));
        const unique = new Set(dValues);
        expect(unique.size).toBe(penguinLike.length);
    });

    it('applies default stroke and no fill', () => {
        const { container } = render(VoronoiTest, {
            props: {
                voronoiArgs: {
                    data: penguinLike,
                    x: 'x',
                    y: 'y'
                }
            }
        });

        const path = container.querySelector('g.voronoi path') as SVGElement;
        expect(path).not.toBeNull();
        expect(path.style.stroke).toBe('currentColor');
        expect(path.style.fill).toBe('none');
    });

    it('applies custom stroke and fill', () => {
        const { container } = render(VoronoiTest, {
            props: {
                voronoiArgs: {
                    data: penguinLike,
                    x: 'x',
                    y: 'y',
                    stroke: 'red',
                    fill: 'blue'
                }
            }
        });

        const path = container.querySelector('g.voronoi path') as SVGElement;
        expect(path.style.stroke).toBe('red');
        expect(path.style.fill).toBe('blue');
    });

    it('maps fill to data channel', () => {
        const { container } = render(VoronoiTest, {
            props: {
                voronoiArgs: {
                    data: penguinLike,
                    x: 'x',
                    y: 'y',
                    fill: 'species'
                }
            }
        });

        const paths = container.querySelectorAll('g.voronoi path');
        expect(paths.length).toBe(penguinLike.length);

        // Species A and B should get different fill colors
        const fillA = (paths[0] as SVGElement).style.fill;
        const fillB = (paths[2] as SVGElement).style.fill;
        expect(fillA).not.toBe(fillB);
    });

    it('maps stroke to data channel', () => {
        const { container } = render(VoronoiTest, {
            props: {
                voronoiArgs: {
                    data: penguinLike,
                    x: 'x',
                    y: 'y',
                    stroke: 'species'
                }
            }
        });

        const paths = container.querySelectorAll('g.voronoi path');
        const strokeA = (paths[0] as SVGElement).style.stroke;
        const strokeB = (paths[2] as SVGElement).style.stroke;
        expect(strokeA).not.toBe(strokeB);
    });

    it('applies custom CSS class', () => {
        const { container } = render(VoronoiTest, {
            props: {
                voronoiArgs: {
                    data: penguinLike,
                    x: 'x',
                    y: 'y',
                    class: 'my-voronoi'
                }
            }
        });

        const group = container.querySelector('g.my-voronoi');
        expect(group).not.toBeNull();
    });

    it('handles empty data', () => {
        const { container } = render(VoronoiTest, {
            props: {
                voronoiArgs: {
                    data: [],
                    x: 'x',
                    y: 'y'
                }
            }
        });

        const paths = container.querySelectorAll('g.voronoi path');
        expect(paths.length).toBe(0);
    });

    it('handles single data point (< 2 valid points)', () => {
        const { container } = render(VoronoiTest, {
            props: {
                voronoiArgs: {
                    data: [{ x: 0.5, y: 0.5 }],
                    x: 'x',
                    y: 'y'
                }
            }
        });

        const paths = container.querySelectorAll('g.voronoi path');
        expect(paths.length).toBe(0);
    });

    it('skips points with invalid coordinates', () => {
        const data = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: null, y: 0.5 },
            { x: 0.5, y: undefined }
        ];

        const { container } = render(VoronoiTest, {
            props: { voronoiArgs: { data, x: 'x', y: 'y' } }
        });

        // Invalid points are filtered from voronoi computation;
        // rendered cells should be fewer than total data points
        const paths = container.querySelectorAll('g.voronoi path');
        expect(paths.length).toBeLessThan(data.length);
        expect(paths.length).toBeGreaterThanOrEqual(2);
    });

    it('applies fillOpacity', () => {
        const { container } = render(VoronoiTest, {
            props: {
                voronoiArgs: {
                    data: penguinLike,
                    x: 'x',
                    y: 'y',
                    fill: 'species',
                    fillOpacity: 0.3
                }
            }
        });

        const path = container.querySelector('g.voronoi path') as SVGElement;
        expect(path.style.fillOpacity).toBe('0.3');
    });

    it('renders with accessor functions', () => {
        const { container } = render(VoronoiTest, {
            props: {
                voronoiArgs: {
                    data: penguinLike,
                    x: (d: (typeof penguinLike)[0]) => d.x,
                    y: (d: (typeof penguinLike)[0]) => d.y
                }
            }
        });

        const paths = container.querySelectorAll('g.voronoi path');
        expect(paths.length).toBe(penguinLike.length);
    });

    it('applies custom strokeWidth', () => {
        const { container } = render(VoronoiTest, {
            props: {
                voronoiArgs: {
                    data: penguinLike,
                    x: 'x',
                    y: 'y',
                    strokeWidth: 3
                }
            }
        });

        const path = container.querySelector('g.voronoi path') as SVGElement;
        expect(path.style.strokeWidth).toBe('3px');
    });

    it('fires onclick with datum', async () => {
        const handler = vi.fn();

        const { container } = render(VoronoiTest, {
            props: {
                voronoiArgs: {
                    data: penguinLike,
                    x: 'x',
                    y: 'y',
                    onclick: (evt: Event, datum: unknown) => handler(datum)
                }
            }
        });

        const paths = container.querySelectorAll('g.voronoi path');
        expect(paths.length).toBe(penguinLike.length);

        await fireEvent.click(paths[0]);
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler.mock.calls[0][0]).toMatchObject(penguinLike[0]);
    });

    it('sets role=button when onclick is provided', () => {
        const { container } = render(VoronoiTest, {
            props: {
                voronoiArgs: {
                    data: penguinLike,
                    x: 'x',
                    y: 'y',
                    onclick: () => {}
                }
            }
        });

        const path = container.querySelector('g.voronoi path');
        expect(path?.getAttribute('role')).toBe('button');
    });

    it('renders no cells for 1D data (x only, no y)', () => {
        // Unlike Observable Plot, svelteplot requires both x and y
        const data = [{ x: 0 }, { x: 0.5 }, { x: 1 }];

        const { container } = render(VoronoiTest, {
            props: {
                voronoiArgs: {
                    data,
                    x: 'x'
                }
            }
        });

        const paths = container.querySelectorAll('g.voronoi path');
        expect(paths.length).toBe(0);
    });
});
