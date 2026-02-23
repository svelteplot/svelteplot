import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
// @ts-ignore - svelte-check errors on .svelte imports, tsc does not
import SphereTest from './sphere.test.svelte';

const projectionArgs = { projection: 'equirectangular' as const };

describe('Sphere', () => {
    it('renders container g with geo-sphere class', () => {
        const { container } = render(SphereTest, {
            props: {
                plotArgs: projectionArgs
            }
        });
        const g = container.querySelector('g.geo.geo-sphere');
        expect(g).not.toBeNull();
        expect(g?.getAttribute('aria-label')).toBe('geo');
    });

    it('renders a single path element', () => {
        const { container } = render(SphereTest, {
            props: {
                plotArgs: projectionArgs
            }
        });
        const paths = container.querySelectorAll('g.geo.geo-sphere path');
        expect(paths.length).toBe(1);
    });

    it('path has valid d attribute', () => {
        const { container } = render(SphereTest, {
            props: {
                plotArgs: projectionArgs
            }
        });
        const path = container.querySelector('g.geo.geo-sphere path') as SVGPathElement;
        const d = path.getAttribute('d');
        expect(d).not.toBeNull();
        expect(d).toMatch(/^M[\d.-]/);
    });

    it('defaults to fill styling', () => {
        const { container } = render(SphereTest, {
            props: {
                plotArgs: projectionArgs
            }
        });
        const path = container.querySelector('g.geo.geo-sphere path') as SVGPathElement;
        expect(path).not.toBeNull();
        expect(path.style.fill).toBe('currentColor');
        expect(path.style.stroke).toBe('none');
    });

    it('applies custom fill color', () => {
        const { container } = render(SphereTest, {
            props: {
                plotArgs: projectionArgs,
                sphereArgs: { fill: 'lightblue' }
            }
        });
        const path = container.querySelector('g.geo.geo-sphere path') as SVGPathElement;
        expect(path.style.fill).toBe('lightblue');
    });
});
