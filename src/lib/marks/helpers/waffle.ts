// A waffle is approximately a rectangular shape, but may have one or two corner
// cuts if the starting or ending value is not an even multiple of the number of
// columns (the width of the waffle in cells). We can represent any waffle by
// 8 points; below is a waffle of five columns representing the interval 2–11:
//
// 1-0
// |•7-------6
// |• • • • •|
// 2---3• • •|
//     4-----5
//
// Note that points 0 and 1 always have the same y-value, points 1 and 2 have
// the same x-value, and so on, so we don’t need to materialize the x- and y-
// values of all points. Also note that we can’t use the already-projected y-
// values because these assume that y-values are distributed linearly along y
// rather than wrapping around in columns.
//
// The corner points may be coincident. If the ending value is an even multiple
// of the number of columns, say representing the interval 2–10, then points 6,
// 7, and 0 are the same.
//
// 1-----0/7/6
// |• • • • •|
// 2---3• • •|
//     4-----5
//
// Likewise if the starting value is an even multiple, say representing the
// interval 0–10, points 2–4 are coincident.
//
// 1-----0/7/6
// |• • • • •|
// |• • • • •|
// 4/3/2-----5
//
// Waffles can also represent fractional intervals (e.g., 2.4–10.1). These
// require additional corner cuts, so the implementation below generates a few
// more points.
//

import type { Snippet } from 'svelte';
import { getPatternId } from 'svelteplot/helpers/getBaseStyles';
import type { StackOptions } from 'svelteplot/transforms/stack';
import type {
    BorderRadius,
    ConstantAccessor,
    PlotScales,
    ScaledDataRecord
} from 'svelteplot/types';

// The last point describes the centroid (used for pointing)
type Point = [number, number];

export type WaffleOptions<T> = {
    /**
     * the quantity represented by each square in the waffle chart, defaults to 1
     */
    unit?: number;
    /**
     * the number of cells per row (or column); defaults to undefined
     */
    multiple?: number;
    /**
     * the separation between adjacent cells, in pixels; defaults to 1
     */
    gap?: number;
    /**
     * whether to round values to avoid partial cells; defaults to false
     */
    round?: boolean;
    stack?: StackOptions;
    borderRadius?: ConstantAccessor<BorderRadius, T>;
    symbol?: Snippet<
        [
            {
                x: number;
                y: number;
                width: number;
                height: number;
                style: string | null;
                styleClass: string | null;
                datum: T;
            }
        ]
    >;
};

type WaffleProps = {
    pattern: {
        id: string;
        patternUnits: 'userSpaceOnUse';
        width: number;
        height: number;
    };
    rect: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    path: {
        fill: string;
        transform: string;
        d: string;
    };
};

export function wafflePolygon(
    y: 'x' | 'y',
    options: WaffleOptions,
    scales: PlotScales
): (d: ScaledDataRecord) => WaffleProps {
    const x = y === 'y' ? 'x' : 'y';
    const y1 = `${y}1`;
    const y2 = `${y}2`;
    const xScale = scales[x as 'x' | 'y'];
    const yScale = scales[y as 'x' | 'y'];

    const barwidth = xScale.fn.bandwidth();

    const { unit = 1, gap = 1 } = options;
    const round = maybeRound(options.round);

    // The length of a unit along y in pixels.
    const scale = Math.abs(yScale.fn(unit) - yScale.fn(0));

    // The number of cells on each row (or column) of the waffle.
    const multiple = options.multiple ?? Math.max(1, Math.floor(Math.sqrt(barwidth / scale)));

    // The outer size of each square cell, in pixels, including the gap.
    const cx = Math.min(barwidth / multiple, scale * multiple);
    const cy = scale * multiple;

    // The reference position.
    const tx = (barwidth - multiple * cx) / 2;

    const transform = y === 'y' ? ([x, y]) => [x * cx, -y * cy] : ([x, y]) => [y * cy, x * cx];
    // const mx = typeof x0 === 'function' ? (i) => x0(i) - barwidth / 2 : () => x0;
    const [ix, iy] = y === 'y' ? [0, 1] : [1, 0];

    const y0 = yScale.fn(0);
    const mx = -barwidth / 2;

    return (d: ScaledDataRecord) => {
        const y1val = d.resolved[y1];
        const y2val = d.resolved[y2];
        const P = wafflePoints(round(y1val / unit), round(y2val / unit), multiple).map(transform);
        P.pop();
        const id = getPatternId();
        const pos = [d[x] + tx + mx, y0];
        return {
            pattern: {
                id,
                patternUnits: 'userSpaceOnUse',
                width: cx,
                height: cy
            },
            rect: {
                x: gap / 2,
                y: gap / 2,
                width: cx - gap,
                height: cy - gap
            },
            path: {
                fill: `url(#${id})`,
                transform: `translate(${pos[ix]},${pos[iy]})`,
                d: `M${P.join('L')}Z`
            }
        };
        // return `M${P.join('L')}Z`;
    };

    // const points = wafflePoints(i1, i2, columns);
    // return dimension === 'x' ? points : points.map(([x, y]: Point): Point => [y, x]);
}

export function wafflePoints(i1: number, i2: number, columns: number): Point[] {
    if (i2 < i1) return wafflePoints(i2, i1, columns); // ensure i1 <= i2
    if (i1 < 0) return wafflePointsOffset(i1, i2, columns, Math.ceil(-Math.min(i1, i2) / columns)); // ensure i1 >= 0
    const x1f = Math.floor(i1 % columns);
    const x1c = Math.ceil(i1 % columns);
    const x2f = Math.floor(i2 % columns);
    const x2c = Math.ceil(i2 % columns);
    const y1f = Math.floor(i1 / columns);
    const y1c = Math.ceil(i1 / columns);
    const y2f = Math.floor(i2 / columns);
    const y2c = Math.ceil(i2 / columns);
    const points: Point[] = [];
    if (y2c > y1c) points.push([0, y1c]);
    points.push([x1f, y1c], [x1f, y1f + (i1 % 1)], [x1c, y1f + (i1 % 1)]);
    if (!(i1 % columns > columns - 1)) {
        points.push([x1c, y1f]);
        if (y2f > y1f) points.push([columns, y1f]);
    }
    if (y2f > y1f) points.push([columns, y2f]);
    points.push([x2c, y2f], [x2c, y2f + (i2 % 1)], [x2f, y2f + (i2 % 1)]);
    if (!(i2 % columns < 1)) {
        points.push([x2f, y2c]);
        if (y2c > y1c) points.push([0, y2c]);
    }
    points.push(waffleCentroid(i1, i2, columns));
    return points;
}

/**
 * Compute waffle points when indices start in negative rows by applying a row offset.
 * - Shifts both indices down by `k` rows (adding `k * columns`) so they are non-negative,
 *   delegates to `wafflePoints`, then translates the resulting points back up by `k` on y.
 * - `k` is the number of rows of vertical offset applied.
 */
function wafflePointsOffset(i1: number, i2: number, columns: number, k: number): Point[] {
    return wafflePoints(i1 + k * columns, i2 + k * columns, columns).map(
        ([x, y]: Point): Point => [x, y - k]
    );
}

/**
 * Centroid of the waffle region representing the interval [i1, i2).
 * Chooses a strategy based on how many rows the interval spans:
 * - Single row: delegate to `waffleRowCentroid`.
 * - Two rows: if the projected columns overlap, return the midpoint of the overlap;
 *   otherwise, return the centroid of the larger partial row.
 * - >= 3 rows: return the center column and halfway between the middle rows.
 */
function waffleCentroid(i1: number, i2: number, columns: number): Point {
    const r = Math.floor(i2 / columns) - Math.floor(i1 / columns);
    return r === 0
        ? // Single row
          waffleRowCentroid(i1, i2, columns)
        : r === 1
          ? // Two incomplete rows; use the midpoint of their overlap if any, otherwise the larger row
            Math.floor(i2 % columns) > Math.ceil(i1 % columns)
              ? [(Math.floor(i2 % columns) + Math.ceil(i1 % columns)) / 2, Math.floor(i2 / columns)]
              : i2 % columns > columns - (i1 % columns)
                ? waffleRowCentroid(i2 - (i2 % columns), i2, columns)
                : waffleRowCentroid(i1, columns * Math.ceil(i1 / columns), columns)
          : // At least one full row; take the midpoint of all the rows that include the middle
            [columns / 2, (Math.round(i1 / columns) + Math.round(i2 / columns)) / 2];
}

/**
 * Centroid of a waffle segment constrained to a single row.
 * Cases:
 * - c === 0: both endpoints fall into the same cell; center on x, average fractional y.
 * - c === 1: two adjacent partial cells; use the overlap center if > 0.5 cell,
 *   otherwise the center of the larger partial cell.
 * - c >= 2: at least one full cell between; x is the midpoint of full cells,
 *   y is the row center (0.5) if there’s a full cell spanned, otherwise average fractional y.
 */
function waffleRowCentroid(i1: number, i2: number, columns: number): Point {
    const c = Math.floor(i2) - Math.floor(i1);
    return c === 0
        ? // Single cell
          [Math.floor(i1 % columns) + 0.5, Math.floor(i1 / columns) + (((i1 + i2) / 2) % 1)]
        : c === 1
          ? // Two incomplete cells; use the overlap if large enough, otherwise use the largest
            (i2 % 1) - (i1 % 1) > 0.5
              ? [Math.ceil(i1 % columns), Math.floor(i2 / columns) + ((i1 % 1) + (i2 % 1)) / 2]
              : i2 % 1 > 1 - (i1 % 1)
                ? [Math.floor(i2 % columns) + 0.5, Math.floor(i2 / columns) + (i2 % 1) / 2]
                : [Math.floor(i1 % columns) + 0.5, Math.floor(i1 / columns) + (1 + (i1 % 1)) / 2]
          : // At least one full cell; take the midpoint
            [
                Math.ceil(i1 % columns) + Math.ceil(Math.floor(i2) - Math.ceil(i1)) / 2,
                Math.floor(i1 / columns) + (i2 >= 1 + i1 ? 0.5 : ((i1 + i2) / 2) % 1)
            ];
}

export function maybeRound(
    round: boolean | ((x: number) => number) | undefined
): (x: number) => number {
    if (round === undefined || round === false) return Number;
    if (round === true) return Math.round;
    if (typeof round !== 'function') throw new Error(`invalid round: ${round}`);
    return round;
}
