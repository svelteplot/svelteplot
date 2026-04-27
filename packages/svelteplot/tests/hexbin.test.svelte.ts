import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
// @ts-ignore - svelte-check errors on .svelte imports, tsc does not
import HexbinTest from './hexbin.test.svelte';

const SQRT3 = Math.sqrt(3);

// Parses one or more "M x,y l a,b v c l d,e l f,g v h Z" hexagonSubpath
// segments out of a path's `d` attribute and returns the list of cell centers.
// hexagonSubpath (helpers/hexLattice.ts:68-78) starts at the top vertex
// (cx, cy - ry); the center is therefore (M.x, M.y + ry). ry is supplied by
// the caller because it depends on the binWidth used at render time.
function extractHexCenters(d: string, ry: number): { x: number; y: number }[] {
    const out: { x: number; y: number }[] = [];
    const re = /M([-\d.]+),([-\d.]+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(d)) !== null) {
        out.push({ x: parseFloat(m[1]), y: parseFloat(m[2]) + ry });
    }
    return out;
}

// Deterministic 10x10 grid of points in [0.05, 0.95] x [0.05, 0.95] data space.
// Produces many populated bins covering the interior of the facet rect, so
// alignment can be checked away from any clipping at the rect edges.
function gridPoints(): { x: number; y: number }[] {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            pts.push({ x: 0.05 + i * 0.1, y: 0.05 + j * 0.1 });
        }
    }
    return pts;
}

// Deterministic dense cluster — points pack into far fewer bins than there
// are points, producing varied counts for the color-scale test and a clear
// bin-count delta for the binWidth-scaling test.
function clusteredPoints(n = 300): { x: number; y: number }[] {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < n; i++) {
        // hash-based pseudo-random in [0, 1), deterministic across runs
        const a = Math.sin(i * 12.9898) * 43758.5453;
        const b = Math.sin(i * 78.233) * 43758.5453;
        pts.push({
            x: 0.3 + 0.4 * (a - Math.floor(a)),
            y: 0.3 + 0.4 * (b - Math.floor(b))
        });
    }
    return pts;
}

describe('Hexbin mark', () => {
    it('empty data renders no bins and does not throw', () => {
        const { container } = render(HexbinTest, {
            props: { data: [] }
        });
        expect(container.querySelectorAll('g.hexbin path').length).toBe(0);
    });

    it('all points in one bin produce one cell', () => {
        // 50 identical points → exactly one bin with count = 50
        const data = Array.from({ length: 50 }, () => ({ x: 0.5, y: 0.5 }));
        const { container } = render(HexbinTest, { props: { data } });
        expect(container.querySelectorAll('g.hexbin path').length).toBe(1);
    });

    it('fill="count" produces non-unknown bin colors', () => {
        // Multi-bin dataset → color scale must populate from count values.
        // Regression test for the FILL_VAL Symbol-copy bug (reduceOutputs writes
        // to __fill, not fill); without the fix every cell rendered with the
        // unknown color #cccccc99.
        const { container } = render(HexbinTest, {
            props: {
                data: clusteredPoints(),
                hexbinArgs: { fill: 'count' },
                plotArgs: { color: { scheme: 'ylGnBu' } } as any
            }
        });
        const paths = Array.from(container.querySelectorAll('g.hexbin path')) as SVGPathElement[];
        expect(paths.length).toBeGreaterThan(1);
        const fills = new Set(paths.map((p) => p.getAttribute('fill') ?? ''));
        for (const fill of fills) {
            // The unknown color is plot.options.color.unknown; default is
            // #cccccc99 for the ylGnBu scheme. Asserting the prefix is enough
            // to catch the regression without coupling to the exact alpha.
            expect(fill.toLowerCase()).not.toMatch(/^#cccccc/);
            expect(fill).not.toBe('currentColor');
            expect(fill).not.toBe('');
        }
        // At least two distinct colors → scale is mapping different counts
        // through the color ramp, not collapsing every bin to one color.
        expect(fills.size).toBeGreaterThanOrEqual(2);
    });

    it('cells are regular hexagons under non-square aspect ratio', () => {
        // 600x300 plot with x∈[0,1], y∈[0,1] → 2:1 facet aspect. If binning
        // happened in data space the cells would distort; pixel-space binning
        // keeps them regular by construction.
        const { container } = render(HexbinTest, {
            props: {
                data: gridPoints(),
                plotArgs: { width: 600, height: 300 },
                hexbinArgs: { binWidth: 24 }
            }
        });
        const path = container.querySelector('g.hexbin path') as SVGPathElement;
        expect(path).not.toBeNull();

        // Parse first subpath: M cx,cy-ry l rx,ry/2 v ry l -rx,ry/2 l -rx,-ry/2 v -ry Z
        const d = path.getAttribute('d') ?? '';
        const tokens = d.match(
            /M([-\d.]+),([-\d.]+)l([-\d.]+),([-\d.]+)v([-\d.]+)l([-\d.]+),([-\d.]+)l([-\d.]+),([-\d.]+)v([-\d.]+)/
        );
        expect(tokens).not.toBeNull();

        const [_, mx, my, l1x, l1y, v1, l2x, l2y, l3x, l3y, v2] = tokens!.map(parseFloat);
        const expectedRx = 24 / 2; // binWidth / 2
        const expectedRy = (expectedRx * 2) / SQRT3; // pointy-top ry from rx
        // First "v" segment height equals ry; "l" x-offsets equal rx.
        expect(Math.abs(v1 - expectedRy)).toBeLessThan(0.05);
        expect(Math.abs(Math.abs(l1x) - expectedRx)).toBeLessThan(0.05);
        expect(Math.abs(Math.abs(l2x) - expectedRx)).toBeLessThan(0.05);
        expect(Math.abs(Math.abs(l3x) - expectedRx)).toBeLessThan(0.05);
        // Up-segment height equals ry (negated)
        expect(Math.abs(Math.abs(v2) - expectedRy)).toBeLessThan(0.05);
    });

    it('larger binWidth produces fewer bins', () => {
        const data = clusteredPoints();
        const { container: small } = render(HexbinTest, {
            props: { data, hexbinArgs: { binWidth: 20 } }
        });
        const { container: large } = render(HexbinTest, {
            props: { data, hexbinArgs: { binWidth: 40 } }
        });
        const nSmall = small.querySelectorAll('g.hexbin path').length;
        const nLarge = large.querySelectorAll('g.hexbin path').length;
        expect(nLarge).toBeLessThan(nSmall);
        // Loose ratio assertion: doubling binWidth quarters the area so we
        // expect fewer bins. Using `< nSmall / 2` to avoid edge-case flakiness.
        expect(nLarge).toBeLessThan(nSmall / 2);
    });

    it('skips records with invalid (NaN/null) coordinates', () => {
        // Mix of valid and invalid records: extent must compute from the valid
        // ones only, and binResult must skip the invalid ones without throwing.
        const data = [
            { x: 0.5, y: 0.5 },
            { x: 0.5, y: 0.5 },
            { x: NaN, y: 0.5 },
            { x: 0.5, y: NaN },
            { x: null, y: 0.5 },
            { x: 0.5, y: null },
            { x: undefined, y: 0.5 }
        ];
        const { container } = render(HexbinTest, { props: { data } });
        // Two valid records collapse to one bin; invalid ones drop out cleanly.
        expect(container.querySelectorAll('g.hexbin path').length).toBe(1);
    });

    it('accepts accessor functions for x and y', () => {
        // Function-form channels should resolve per record like string-form.
        // Records carry positions in nested fields; only accessor functions
        // can reach them.
        const data = Array.from({ length: 50 }, () => ({
            pos: { lon: 0.5, lat: 0.5 }
        }));
        const { container } = render(HexbinTest, {
            props: {
                data,
                hexbinArgs: {
                    x: (d: any) => d.pos.lon,
                    y: (d: any) => d.pos.lat
                } as any
            }
        });
        expect(container.querySelectorAll('g.hexbin path').length).toBe(1);
    });

    it('applies a custom CSS class to the wrapper group', () => {
        const { container } = render(HexbinTest, {
            props: {
                data: gridPoints(),
                hexbinArgs: { class: 'my-hexbin' }
            }
        });
        expect(container.querySelector('g.my-hexbin')).not.toBeNull();
        // The default `g.hexbin` should NOT also be present — class replaces,
        // not appends.
        expect(container.querySelector('g.hexbin')).toBeNull();
    });

    it('faceted plot bins each panel independently (fx)', () => {
        // Two facet groups with different point distributions: group A has
        // points clustered at (0.5, 0.5); group B has points spread on a 3x3
        // grid. Without per-facet binning all points share one bin map and
        // each panel renders the union — group A would show grid cells, group
        // B would show the cluster cell. With per-facet binning each panel
        // shows only its own data.
        const groupA = Array.from({ length: 30 }, () => ({
            x: 0.5,
            y: 0.5,
            grp: 'A'
        }));
        const groupB: { x: number; y: number; grp: string }[] = [];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                groupB.push({ x: 0.2 + i * 0.3, y: 0.2 + j * 0.3, grp: 'B' });
            }
        }
        const data = [...groupA, ...groupB];

        const { container } = render(HexbinTest, {
            props: {
                data,
                hexbinArgs: { fx: 'grp', facet: 'include' as any },
                plotArgs: { width: 600, height: 300 }
            }
        });

        // Two facet panels should exist (one per grp value); each panel has
        // its own g.hexbin group inside it.
        const panels = container.querySelectorAll('g.hexbin');
        expect(panels.length).toBe(2);

        // Per-panel cell counts: group A collapses to 1 bin (all points
        // identical); group B's 9 points spread across multiple bins. If
        // faceting were broken, both panels would show the union (>= 2 cells
        // each), and the cell counts would be equal.
        const cellCounts = Array.from(panels).map((p) => p.querySelectorAll('path').length);
        const sorted = [...cellCounts].sort((a, b) => a - b);
        expect(sorted[0]).toBe(1); // group A: one bin
        expect(sorted[1]).toBeGreaterThan(1); // group B: multiple bins
    });

    it('Hexbin and Hexgrid centers align with default binWidth', () => {
        // The promise of pairing Hexbin + Hexgrid at the same binWidth is that
        // every bin cell coincides exactly with a grid cell. This breaks if
        // the two marks use different lattice origins.
        const binWidth = 20;
        const ry = binWidth / SQRT3;

        const { container } = render(HexbinTest, {
            props: {
                data: gridPoints(),
                hexbinArgs: { binWidth },
                hexgridArgs: { binWidth },
                showGrid: true
            }
        });

        const gridPath = container.querySelector('g.hexgrid path');
        const binPaths = container.querySelectorAll('g.hexbin path');
        expect(gridPath).not.toBeNull();
        expect(binPaths.length).toBeGreaterThan(0);

        const gridCenters = extractHexCenters(gridPath!.getAttribute('d') ?? '', ry);
        const binCenters = Array.from(binPaths).flatMap((p) =>
            extractHexCenters(p.getAttribute('d') ?? '', ry)
        );

        // For every bin, find the nearest grid center. Sub-pixel tolerance
        // (0.5 px) is appropriate because both marks build the same lattice
        // through the same helper — alignment should be exact modulo
        // toFixed(3) rounding inside hexagonSubpath.
        for (const bin of binCenters) {
            let minDist = Infinity;
            for (const grid of gridCenters) {
                const d = Math.hypot(bin.x - grid.x, bin.y - grid.y);
                if (d < minDist) minDist = d;
            }
            expect(minDist).toBeLessThan(0.5);
        }
    });
});
