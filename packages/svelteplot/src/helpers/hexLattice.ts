// Shared hex lattice math used by the `hexbin` transform and the `Hexgrid`
// mark so binning and the grid overlay always tile the same lattice. Pointy-
// topped hexagons; odd rows are offset horizontally by rx. The lattice is
// unit-agnostic — callers pass pitches in pixels (Hexgrid pixel mode) or in
// data units (data-space mode).

const SQRT3 = Math.sqrt(3);

export const HEX_DEFAULT_BIN_WIDTH = 20;

export type HexLattice = {
    rx: number;
    ry: number;
    dx: number;
    dy: number;
    originX: number;
    originY: number;
};

// Build a regular pointy-topped hex lattice from a single pitch. dy is the
// canonical dx*√3/2 row pitch for tiling regular hexagons — used by Hexgrid
// pixel mode and any caller working in a single coordinate system.
export function hexLattice(binWidth: number, originX = 0, originY = 0): HexLattice {
    const rx = binWidth / 2;
    const ry = (rx * 2) / SQRT3;
    return { rx, ry, dx: binWidth, dy: ry * 1.5, originX, originY };
}

// Build a lattice with independent column and row pitches. Use this when the
// x and y axes have different units (data-space hexbin), so each axis's pitch
// can be scaled by its own data extent and still tile cleanly.
export function hexLatticeXY(dx: number, dy: number, originX = 0, originY = 0): HexLattice {
    // ry is the vertical half-bounding-box; row pitch dy = 1.5 * ry, so ry = 2/3 dy.
    return { rx: dx / 2, ry: (dy * 2) / 3, dx, dy, originX, originY };
}

export function hexCenter(i: number, j: number, lattice: HexLattice): [number, number] {
    const cx = lattice.originX + (i + (j & 1) / 2) * lattice.dx;
    const cy = lattice.originY + j * lattice.dy;
    return [cx, cy];
}

// Snaps a pixel point to the nearest hex cell. Must check the rounded row and
// both neighbors because the row-offset lattice lets an adjacent row be closer
// than the rounded one.
export function pointToHex(
    px: number,
    py: number,
    lattice: HexLattice
): { i: number; j: number; cx: number; cy: number } {
    const { dx, dy, originX, originY } = lattice;
    const rx = dx / 2;
    const pj = Math.round((py - originY) / dy) || 0;

    let best = { i: 0, j: 0, cx: 0, cy: 0, d2: Infinity };
    for (const dj of [0, 1, -1]) {
        const cj = pj + dj;
        const ci = Math.round((px - originX - (cj & 1) * rx) / dx) || 0;
        const cx = originX + (ci + (cj & 1) / 2) * dx;
        const cy = originY + cj * dy;
        const d2 = (px - cx) ** 2 + (py - cy) ** 2;
        if (d2 < best.d2) best = { i: ci, j: cj, cx, cy, d2 };
    }
    return { i: best.i, j: best.j, cx: best.cx, cy: best.cy };
}

// SVG subpath for a single pointy-topped hex, rounded to compact the output.
export function hexagonSubpath(cx: number, cy: number, rx: number, ry: number): string {
    const r3 = (n: number) => Math.round(n * 1000) / 1000;
    return (
        `M${r3(cx)},${r3(cy - ry)}` +
        `l${r3(rx)},${r3(ry / 2)}` +
        `v${r3(ry)}` +
        `l${r3(-rx)},${r3(ry / 2)}` +
        `l${r3(-rx)},${r3(-ry / 2)}` +
        `v${r3(-ry)}Z`
    );
}

// Iterate hex cell centers covering the given pixel rect. Pads by one cell so
// a clipPath can trim the edges cleanly without gaps.
export function* hexCellsInRect(
    lattice: HexLattice,
    x0: number,
    y0: number,
    x1: number,
    y1: number
): Generator<[number, number]> {
    const { dx, dy, originX, originY, rx, ry } = lattice;
    const jMin = Math.floor((y0 - originY - ry) / dy);
    const jMax = Math.ceil((y1 - originY + ry) / dy);
    for (let j = jMin; j <= jMax; j++) {
        const xOffset = (j & 1) * (dx / 2);
        const iMin = Math.floor((x0 - originX - xOffset - rx) / dx);
        const iMax = Math.ceil((x1 - originX - xOffset + rx) / dx);
        for (let i = iMin; i <= iMax; i++) {
            const cx = originX + (i + (j & 1) / 2) * dx;
            const cy = originY + j * dy;
            yield [cx, cy];
        }
    }
}
