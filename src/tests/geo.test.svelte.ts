import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
// @ts-ignore - svelte-check errors on .svelte imports, tsc does not
import GeoTest from './geo.test.svelte';

const polygon: GeoJSON.Polygon = {
    type: 'Polygon',
    coordinates: [
        [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
            [0, 0]
        ]
    ]
};

const lineString: GeoJSON.LineString = {
    type: 'LineString',
    coordinates: [
        [0, 0],
        [10, 10],
        [20, 0]
    ]
};

const point: GeoJSON.Point = {
    type: 'Point',
    coordinates: [5, 5]
};

const projectionArgs = { projection: 'equirectangular' as const };

describe('Geo', () => {
    it('renders a single path with geo class and aria-label', () => {
        const { container } = render(GeoTest, {
            props: {
                plotArgs: projectionArgs,
                geoArgs: { data: [polygon] }
            }
        });
        const path = container.querySelector('path.geo');
        expect(path).not.toBeNull();
        expect(path?.getAttribute('aria-label')).toBe('geo');
        expect(container.querySelector('g.geo')).toBeNull();
    });

    it('renders a path element for single GeoJSON data', () => {
        const { container } = render(GeoTest, {
            props: {
                plotArgs: projectionArgs,
                geoArgs: { data: [polygon] }
            }
        });
        const paths = container.querySelectorAll('path.geo');
        expect(paths.length).toBe(1);
    });

    it('applies fill styling for polygon geometries', () => {
        const { container } = render(GeoTest, {
            props: {
                plotArgs: projectionArgs,
                geoArgs: { data: [polygon] }
            }
        });
        const path = container.querySelector('path.geo') as SVGPathElement;
        expect(path).not.toBeNull();
        expect(path.style.fill).toBe('currentColor');
        expect(path.style.stroke).toBe('none');
    });

    it('applies stroke styling for LineString geometries', () => {
        const { container } = render(GeoTest, {
            props: {
                plotArgs: projectionArgs,
                geoArgs: { data: [lineString] }
            }
        });
        const path = container.querySelector('path.geo') as SVGPathElement;
        expect(path).not.toBeNull();
        expect(path.style.stroke).toBe('currentColor');
        expect(path.style.fill).toBe('none');
    });

    it('wraps multiple features in a geo group', () => {
        const { container } = render(GeoTest, {
            props: {
                plotArgs: projectionArgs,
                geoArgs: { data: [polygon, lineString, point] }
            }
        });
        const group = container.querySelector('g.geo');
        expect(group).not.toBeNull();
        expect(group?.getAttribute('aria-label')).toBe('geo');
        const paths = container.querySelectorAll('g.geo path');
        expect(paths.length).toBe(3);
    });

    it('applies custom fill color', () => {
        const { container } = render(GeoTest, {
            props: {
                plotArgs: projectionArgs,
                geoArgs: { data: [polygon], fill: 'steelblue' }
            }
        });
        const path = container.querySelector('path.geo') as SVGPathElement;
        expect(path.style.fill).toBe('steelblue');
    });

    it('applies custom stroke color', () => {
        const { container } = render(GeoTest, {
            props: {
                plotArgs: projectionArgs,
                geoArgs: { data: [lineString], stroke: 'red' }
            }
        });
        const path = container.querySelector('path.geo') as SVGPathElement;
        expect(path.style.stroke).toBe('red');
    });

    it('applies custom CSS class', () => {
        const { container } = render(GeoTest, {
            props: {
                plotArgs: projectionArgs,
                geoArgs: { data: [polygon], class: 'my-geo' }
            }
        });
        const path = container.querySelector('path.geo.my-geo');
        expect(path).not.toBeNull();
    });

    it('renders title element when title prop is set', () => {
        const { container } = render(GeoTest, {
            props: {
                plotArgs: projectionArgs,
                geoArgs: { data: [polygon], title: 'My polygon' }
            }
        });
        const path = container.querySelector('path.geo') as SVGPathElement;
        expect(path).not.toBeNull();
        const title = path.querySelector('title');
        expect(title).not.toBeNull();
        expect(title?.textContent).toBe('My polygon');
    });

    it('all paths have valid d attributes', () => {
        const { container } = render(GeoTest, {
            props: {
                plotArgs: projectionArgs,
                geoArgs: { data: [polygon, lineString, point] }
            }
        });
        const paths = container.querySelectorAll('g.geo path');
        expect(paths.length).toBe(3);
        paths.forEach((path) => {
            const d = path.getAttribute('d');
            expect(d).not.toBeNull();
            expect(d).toMatch(/^M[\d.-]/);
        });
    });
});
