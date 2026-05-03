import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
// @ts-ignore - svelte-check errors on .svelte imports, tsc does not
import HexgridTest from './hexgrid.test.svelte';

describe('Hexgrid mark', () => {
    it('renders a single path element', () => {
        const { container } = render(HexgridTest);

        const paths = container.querySelectorAll('g.hexgrid path');
        expect(paths.length).toBe(1);
    });

    it('produces a valid hexagonal path', () => {
        const { container } = render(HexgridTest);

        const d = container.querySelector('g.hexgrid path')?.getAttribute('d');
        expect(d).toBeTruthy();
        expect(d).toContain('M');
        // Hexagons are closed with Z
        expect(d).toContain('Z');
        // Pointy-topped hexagons use vertical lines (v) and diagonal lines (l)
        expect(d).toContain('l');
        expect(d).toContain('v');
    });

    it('applies default styling', () => {
        const { container } = render(HexgridTest);

        const path = container.querySelector('g.hexgrid path') as SVGElement;
        expect(path.getAttribute('stroke')).toBe('currentColor');
        expect(path.getAttribute('stroke-opacity')).toBe('0.1');
        expect(path.getAttribute('stroke-width')).toBe('1');
        expect(path.getAttribute('fill')).toBe('none');
    });

    it('applies custom stroke', () => {
        const { container } = render(HexgridTest, {
            props: { gridArgs: { stroke: 'red' } }
        });

        const path = container.querySelector('g.hexgrid path') as SVGElement;
        expect(path.getAttribute('stroke')).toBe('red');
    });

    it('applies custom strokeOpacity', () => {
        const { container } = render(HexgridTest, {
            props: { gridArgs: { strokeOpacity: 0.5 } }
        });

        const path = container.querySelector('g.hexgrid path') as SVGElement;
        expect(path.getAttribute('stroke-opacity')).toBe('0.5');
    });

    it('applies custom strokeWidth', () => {
        const { container } = render(HexgridTest, {
            props: { gridArgs: { strokeWidth: 2 } }
        });

        const path = container.querySelector('g.hexgrid path') as SVGElement;
        expect(path.getAttribute('stroke-width')).toBe('2');
    });

    it('applies custom fill and fillOpacity', () => {
        const { container } = render(HexgridTest, {
            props: { gridArgs: { fill: 'blue', fillOpacity: 0.3 } }
        });

        const path = container.querySelector('g.hexgrid path') as SVGElement;
        expect(path.getAttribute('fill')).toBe('blue');
        expect(path.getAttribute('fill-opacity')).toBe('0.3');
    });

    it('applies custom CSS class', () => {
        const { container } = render(HexgridTest, {
            props: { gridArgs: { class: 'my-grid' } }
        });

        expect(container.querySelector('g.my-grid')).not.toBeNull();
    });

    it('changes path with different binWidth', () => {
        const { container: c1 } = render(HexgridTest, {
            props: { gridArgs: { binWidth: 10 } }
        });
        const { container: c2 } = render(HexgridTest, {
            props: { gridArgs: { binWidth: 30 } }
        });

        const d1 = c1.querySelector('g.hexgrid path')?.getAttribute('d');
        const d2 = c2.querySelector('g.hexgrid path')?.getAttribute('d');
        expect(d1).not.toBe(d2);
    });

    it('smaller binWidth produces more hexagons', () => {
        const { container: small } = render(HexgridTest, {
            props: { gridArgs: { binWidth: 10 } }
        });
        const { container: large } = render(HexgridTest, {
            props: { gridArgs: { binWidth: 40 } }
        });

        const dSmall = small.querySelector('g.hexgrid path')?.getAttribute('d') ?? '';
        const dLarge = large.querySelector('g.hexgrid path')?.getAttribute('d') ?? '';

        // Count hexagons by counting Z closings
        const countSmall = (dSmall.match(/Z/g) ?? []).length;
        const countLarge = (dLarge.match(/Z/g) ?? []).length;
        expect(countSmall).toBeGreaterThan(countLarge);
    });

    it('adapts to non-square plot dimensions', () => {
        const { container: square } = render(HexgridTest, {
            props: { gridArgs: { binWidth: 20 } }
        });
        const { container: wide } = render(HexgridTest, {
            props: {
                plotArgs: { width: 200, height: 50 },
                gridArgs: { binWidth: 20 }
            }
        });

        const dSquare = square.querySelector('g.hexgrid path')?.getAttribute('d') ?? '';
        const dWide = wide.querySelector('g.hexgrid path')?.getAttribute('d') ?? '';
        expect(dSquare).not.toBe(dWide);
    });
});
