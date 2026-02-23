import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
// @ts-ignore - svelte-check errors on .svelte imports, tsc does not
import GraticuleTest from './graticule.test.svelte';

const projectionArgs = { projection: 'equirectangular' as const };

describe('Graticule', () => {
    it('renders container g with geo-graticule class', () => {
        const { container } = render(GraticuleTest, {
            props: {
                plotArgs: projectionArgs
            }
        });
        const g = container.querySelector('g.geo.geo-graticule');
        expect(g).not.toBeNull();
        expect(g?.getAttribute('aria-label')).toBe('geo');
    });

    it('renders a single path element', () => {
        const { container } = render(GraticuleTest, {
            props: {
                plotArgs: projectionArgs
            }
        });
        const paths = container.querySelectorAll('g.geo.geo-graticule path');
        expect(paths.length).toBe(1);
    });

    it('defaults to stroke styling', () => {
        const { container } = render(GraticuleTest, {
            props: {
                plotArgs: projectionArgs
            }
        });
        const path = container.querySelector('g.geo.geo-graticule path') as SVGPathElement;
        expect(path).not.toBeNull();
        expect(path.style.stroke).toBe('currentColor');
        expect(path.style.fill).toBe('none');
    });

    it('applies custom stroke color', () => {
        const { container } = render(GraticuleTest, {
            props: {
                plotArgs: projectionArgs,
                graticuleArgs: { stroke: 'gray' }
            }
        });
        const path = container.querySelector('g.geo.geo-graticule path') as SVGPathElement;
        expect(path.style.stroke).toBe('gray');
    });
});
