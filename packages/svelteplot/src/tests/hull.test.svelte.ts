import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
// @ts-ignore - svelte-check errors on .svelte imports, tsc does not
import HullTest from './hull.test.svelte';

const grouped = [
    { x: 0, y: 0, species: 'A' },
    { x: 0.3, y: 0.1, species: 'A' },
    { x: 0.1, y: 0.3, species: 'A' },
    { x: 0.7, y: 0.8, species: 'B' },
    { x: 1, y: 1, species: 'B' },
    { x: 0.8, y: 0.7, species: 'B' }
];

const ungrouped = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0.5, y: 1 },
    { x: 0, y: 1 }
];

describe('Hull mark', () => {
    it('renders one hull path when ungrouped', () => {
        const { container } = render(HullTest, {
            props: {
                hullArgs: {
                    data: ungrouped,
                    x: 'x',
                    y: 'y'
                }
            }
        });

        const paths = container.querySelectorAll('g.hull path');
        expect(paths.length).toBe(1);
    });

    it('produces a closed path', () => {
        const { container } = render(HullTest, {
            props: {
                hullArgs: {
                    data: ungrouped,
                    x: 'x',
                    y: 'y'
                }
            }
        });

        const d = container.querySelector('g.hull path')?.getAttribute('d');
        expect(d).toBeTruthy();
        expect(d).toContain('M');
        expect(d).toContain('Z');
    });

    it('renders separate hull per group via stroke channel', () => {
        const { container } = render(HullTest, {
            props: {
                hullArgs: {
                    data: grouped,
                    x: 'x',
                    y: 'y',
                    stroke: 'species'
                }
            }
        });

        const paths = container.querySelectorAll('g.hull path');
        expect(paths.length).toBe(2);
    });

    it('renders separate hull per group via fill channel', () => {
        const { container } = render(HullTest, {
            props: {
                hullArgs: {
                    data: grouped,
                    x: 'x',
                    y: 'y',
                    fill: 'species'
                }
            }
        });

        const paths = container.querySelectorAll('g.hull path');
        expect(paths.length).toBe(2);
    });

    it('renders separate hull per group via z channel', () => {
        const { container } = render(HullTest, {
            props: {
                hullArgs: {
                    data: grouped,
                    x: 'x',
                    y: 'y',
                    z: 'species'
                }
            }
        });

        const paths = container.querySelectorAll('g.hull path');
        expect(paths.length).toBe(2);
    });

    it('groups have different stroke colors', () => {
        const { container } = render(HullTest, {
            props: {
                hullArgs: {
                    data: grouped,
                    x: 'x',
                    y: 'y',
                    stroke: 'species'
                }
            }
        });

        const paths = container.querySelectorAll('g.hull path');
        expect(paths.length).toBe(2);
        const stroke0 = (paths[0] as SVGElement).style.stroke;
        const stroke1 = (paths[1] as SVGElement).style.stroke;
        expect(stroke0).not.toBe(stroke1);
    });

    it('groups have different fill colors', () => {
        const { container } = render(HullTest, {
            props: {
                hullArgs: {
                    data: grouped,
                    x: 'x',
                    y: 'y',
                    fill: 'species',
                    fillOpacity: 0.2
                }
            }
        });

        const paths = container.querySelectorAll('g.hull path');
        expect(paths.length).toBe(2);
        const fill0 = (paths[0] as SVGElement).style.fill;
        const fill1 = (paths[1] as SVGElement).style.fill;
        expect(fill0).not.toBe(fill1);
    });

    it('applies default stroke and no fill', () => {
        const { container } = render(HullTest, {
            props: {
                hullArgs: {
                    data: ungrouped,
                    x: 'x',
                    y: 'y'
                }
            }
        });

        const path = container.querySelector('g.hull path') as SVGElement;
        expect(path.style.stroke).toBe('currentColor');
        expect(path.style.fill).toBe('none');
    });

    it('applies custom strokeWidth', () => {
        const { container } = render(HullTest, {
            props: {
                hullArgs: {
                    data: ungrouped,
                    x: 'x',
                    y: 'y',
                    strokeWidth: 3
                }
            }
        });

        const path = container.querySelector('g.hull path') as SVGElement;
        expect(path.style.strokeWidth).toBe('3px');
    });

    it('applies custom CSS class', () => {
        const { container } = render(HullTest, {
            props: {
                hullArgs: {
                    data: ungrouped,
                    x: 'x',
                    y: 'y',
                    class: 'my-hull'
                }
            }
        });

        expect(container.querySelector('g.my-hull')).not.toBeNull();
    });

    it('handles empty data', () => {
        const { container } = render(HullTest, {
            props: {
                hullArgs: { data: [], x: 'x', y: 'y' }
            }
        });

        const paths = container.querySelectorAll('g.hull path');
        expect(paths.length).toBe(0);
    });

    it('handles single data point', () => {
        const { container } = render(HullTest, {
            props: {
                hullArgs: {
                    data: [{ x: 0.5, y: 0.5 }],
                    x: 'x',
                    y: 'y'
                }
            }
        });

        const paths = container.querySelectorAll('g.hull path');
        expect(paths.length).toBe(0);
    });

    it('skips group with fewer than 2 points', () => {
        const data = [
            { x: 0, y: 0, g: 'A' },
            { x: 1, y: 1, g: 'A' },
            { x: 0.5, y: 0.5, g: 'A' },
            { x: 0.5, y: 0.8, g: 'B' } // only 1 point in group B
        ];

        const { container } = render(HullTest, {
            props: {
                hullArgs: {
                    data,
                    x: 'x',
                    y: 'y',
                    stroke: 'g'
                }
            }
        });

        // Only group A should produce a hull
        const paths = container.querySelectorAll('g.hull path');
        expect(paths.length).toBe(1);
    });

    it('renders with accessor functions', () => {
        const { container } = render(HullTest, {
            props: {
                hullArgs: {
                    data: ungrouped,
                    x: (d: (typeof ungrouped)[0]) => d.x,
                    y: (d: (typeof ungrouped)[0]) => d.y
                }
            }
        });

        const paths = container.querySelectorAll('g.hull path');
        expect(paths.length).toBe(1);
    });
});
