import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
// @ts-ignore - svelte-check errors on .svelte imports, tsc does not
import DelaunayMeshTest from './delaunayMesh.test.svelte';

const points = [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
    { x: 0.5, y: 0.5 },
    { x: 0.2, y: 0.8 }
];

describe('DelaunayMesh mark', () => {
    it('renders a single path', () => {
        const { container } = render(DelaunayMeshTest, {
            props: {
                meshArgs: {
                    data: points,
                    x: 'x',
                    y: 'y'
                }
            }
        });

        const paths = container.querySelectorAll('g.delaunay-mesh path');
        expect(paths.length).toBe(1);
    });

    it('produces a valid triangulation path', () => {
        const { container } = render(DelaunayMeshTest, {
            props: {
                meshArgs: {
                    data: points,
                    x: 'x',
                    y: 'y'
                }
            }
        });

        const path = container.querySelector('g.delaunay-mesh path');
        const d = path?.getAttribute('d');
        expect(d).toBeTruthy();
        expect(d).toContain('M');
        expect(d).toContain('L');
    });

    it('applies default fill=none and stroke=currentColor', () => {
        const { container } = render(DelaunayMeshTest, {
            props: {
                meshArgs: {
                    data: points,
                    x: 'x',
                    y: 'y'
                }
            }
        });

        const path = container.querySelector('g.delaunay-mesh path') as SVGElement;
        expect(path.style.fill).toBe('none');
        expect(path.style.stroke).toBe('currentColor');
    });

    it('applies custom strokeWidth', () => {
        const { container } = render(DelaunayMeshTest, {
            props: {
                meshArgs: {
                    data: points,
                    x: 'x',
                    y: 'y',
                    strokeWidth: 2.5
                }
            }
        });

        const path = container.querySelector('g.delaunay-mesh path') as SVGElement;
        expect(path.style.strokeWidth).toBe('2.5px');
    });

    it('applies custom strokeOpacity', () => {
        const { container } = render(DelaunayMeshTest, {
            props: {
                meshArgs: {
                    data: points,
                    x: 'x',
                    y: 'y',
                    strokeOpacity: 0.2
                }
            }
        });

        const path = container.querySelector('g.delaunay-mesh path') as SVGElement;
        expect(path.style.strokeOpacity).toBe('0.2');
    });

    it('applies custom CSS class', () => {
        const { container } = render(DelaunayMeshTest, {
            props: {
                meshArgs: {
                    data: points,
                    x: 'x',
                    y: 'y',
                    class: 'my-mesh'
                }
            }
        });

        expect(container.querySelector('g.my-mesh')).not.toBeNull();
    });

    it('handles empty data', () => {
        const { container } = render(DelaunayMeshTest, {
            props: {
                meshArgs: { data: [], x: 'x', y: 'y' }
            }
        });

        const paths = container.querySelectorAll('g.delaunay-mesh path');
        expect(paths.length).toBe(0);
    });

    it('handles single data point', () => {
        const { container } = render(DelaunayMeshTest, {
            props: {
                meshArgs: {
                    data: [{ x: 0.5, y: 0.5 }],
                    x: 'x',
                    y: 'y'
                }
            }
        });

        const paths = container.querySelectorAll('g.delaunay-mesh path');
        expect(paths.length).toBe(0);
    });

    it('skips points with invalid coordinates', () => {
        const data = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: null, y: 0.5 }
        ];

        const { container } = render(DelaunayMeshTest, {
            props: { meshArgs: { data, x: 'x', y: 'y' } }
        });

        const paths = container.querySelectorAll('g.delaunay-mesh path');
        expect(paths.length).toBe(1);
    });

    it('renders with accessor functions', () => {
        const { container } = render(DelaunayMeshTest, {
            props: {
                meshArgs: {
                    data: points,
                    x: (d: (typeof points)[0]) => d.x,
                    y: (d: (typeof points)[0]) => d.y
                }
            }
        });

        const paths = container.querySelectorAll('g.delaunay-mesh path');
        expect(paths.length).toBe(1);
    });
});
