import { describe, it, expect } from 'vitest';
import { hexLattice, hexCenter, pointToHex, hexagonSubpath, hexCellsInRect } from './hexLattice.js';

describe('hexLattice', () => {
    it('computes rx, ry, dx, dy for a given binWidth', () => {
        const l = hexLattice(20);
        expect(l.rx).toBe(10);
        expect(l.dx).toBe(20);
        expect(l.ry).toBeCloseTo(20 / Math.sqrt(3), 6);
        expect(l.dy).toBeCloseTo(l.ry * 1.5, 6);
    });

    it('hexCenter places even rows unoffset and odd rows offset by rx', () => {
        const l = hexLattice(20, 100, 50);
        expect(hexCenter(0, 0, l)).toEqual([100, 50]);
        expect(hexCenter(1, 0, l)).toEqual([120, 50]);
        const [oddCx, oddCy] = hexCenter(0, 1, l);
        expect(oddCx).toBeCloseTo(110, 6);
        expect(oddCy).toBeCloseTo(50 + l.dy, 6);
    });

    it('pointToHex snaps a point at cell center to itself', () => {
        const l = hexLattice(20, 100, 50);
        const { cx, cy } = pointToHex(100, 50, l);
        expect(cx).toBeCloseTo(100, 6);
        expect(cy).toBeCloseTo(50, 6);
    });

    it('pointToHex snaps neighboring points to the same cell', () => {
        const l = hexLattice(20, 100, 50);
        const a = pointToHex(101, 51, l);
        const b = pointToHex(99, 49, l);
        expect(a.i).toBe(b.i);
        expect(a.j).toBe(b.j);
    });

    it('pointToHex picks an adjacent row when closer than the rounded row', () => {
        const l = hexLattice(20, 0, 0);
        // Point sitting between row 0 and row 1 but aligned with row 1's x offset
        const { i, j } = pointToHex(10, l.dy - 0.1, l);
        expect(j).toBe(1);
        expect(i).toBe(0);
    });

    it('hexagonSubpath starts at the top vertex and returns a closed path', () => {
        const path = hexagonSubpath(100, 50, 10, 11.547);
        expect(path.startsWith('M100,')).toBe(true);
        expect(path.endsWith('Z')).toBe(true);
    });

    it('hexCellsInRect yields cells covering the rect with overdraw padding', () => {
        const l = hexLattice(20, 10, 10);
        const cells = [...hexCellsInRect(l, 0, 0, 40, 40)];
        expect(cells.length).toBeGreaterThan(0);
        // Every rect corner should be covered by at least one cell center within
        // one cell pitch, i.e. the padding does its job.
        const hasCoverNear = (x: number, y: number) =>
            cells.some(([cx, cy]) => Math.abs(cx - x) <= l.dx && Math.abs(cy - y) <= l.dy);
        expect(hasCoverNear(0, 0)).toBe(true);
        expect(hasCoverNear(40, 40)).toBe(true);
    });
});
