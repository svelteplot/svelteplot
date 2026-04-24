import { Delaunay } from 'd3-delaunay';
import { randomLcg } from 'd3-random';

export type InterpolateFunction = (
    index: number[],
    width: number,
    height: number,
    X: Float64Array,
    Y: Float64Array,
    V: ArrayLike<any>
) => ArrayLike<any>;

/**
 * Simple forward mapping: each sample is binned to its nearest pixel.
 * If multiple samples map to the same pixel, the last one wins.
 */
export function interpolateNone(
    index: number[],
    width: number,
    height: number,
    X: Float64Array,
    Y: Float64Array,
    V: ArrayLike<any>
): any[] {
    const W: any[] = new Array(width * height);
    for (const i of index) {
        if (X[i] < 0 || X[i] >= width || Y[i] < 0 || Y[i] >= height) continue;
        W[Math.floor(Y[i]) * width + Math.floor(X[i])] = V[i];
    }
    return W;
}

/**
 * Nearest-neighbor interpolation using Delaunay triangulation.
 */
export function interpolateNearest(
    index: number[],
    width: number,
    height: number,
    X: Float64Array,
    Y: Float64Array,
    V: ArrayLike<any>
): any {
    const n = width * height;
    // Use typed array if V is typed, otherwise plain array
    const W: any = isTypedArray(V) ? new (V as any).constructor(n) : new Array(n);
    const delaunay = Delaunay.from(
        index,
        (i: number) => X[i],
        (i: number) => Y[i]
    );
    // Memoize delaunay.find for the line start (iy) and current pixel (ix)
    let iy: number | undefined, ix: number | undefined;
    for (let y = 0.5, k = 0; y < height; ++y) {
        ix = iy;
        for (let x = 0.5; x < width; ++x, ++k) {
            ix = delaunay.find(x, y, ix);
            if (x === 0.5) iy = ix;
            W[k] = V[index[ix!]];
        }
    }
    return W;
}

/**
 * Barycentric interpolation: fills the interior of each Delaunay triangle with
 * barycentric-weighted values, then extrapolates exterior pixels to the hull.
 */
export function interpolatorBarycentric({ random = randomLcg(42) } = {}): InterpolateFunction {
    return (index, width, height, X, Y, V) => {
        const { points, triangles, hull } = Delaunay.from(
            index,
            (i: number) => X[i],
            (i: number) => Y[i]
        );
        const n = width * height;
        const W: any = isTypedArray(V)
            ? new (V as any).constructor(n).fill(NaN)
            : new Array(n).fill(NaN);
        const S = new Uint8Array(n); // 1 if pixel has been written
        const mix = mixer(V, random);

        for (let i = 0; i < triangles.length; i += 3) {
            const ta = triangles[i];
            const tb = triangles[i + 1];
            const tc = triangles[i + 2];
            const Ax = points[2 * ta];
            const Bx = points[2 * tb];
            const Cx = points[2 * tc];
            const Ay = points[2 * ta + 1];
            const By = points[2 * tb + 1];
            const Cy = points[2 * tc + 1];
            const x1 = Math.min(Ax, Bx, Cx);
            const x2 = Math.max(Ax, Bx, Cx);
            const y1 = Math.min(Ay, By, Cy);
            const y2 = Math.max(Ay, By, Cy);
            const z = (By - Cy) * (Ax - Cx) + (Ay - Cy) * (Cx - Bx);
            if (!z) continue;
            const va = V[index[ta]];
            const vb = V[index[tb]];
            const vc = V[index[tc]];
            for (let x = Math.floor(x1); x < x2; ++x) {
                for (let y = Math.floor(y1); y < y2; ++y) {
                    if (x < 0 || x >= width || y < 0 || y >= height) continue;
                    const xp = x + 0.5;
                    const yp = y + 0.5;
                    const s = Math.sign(z);
                    const ga = (By - Cy) * (xp - Cx) + (yp - Cy) * (Cx - Bx);
                    if (ga * s < 0) continue;
                    const gb = (Cy - Ay) * (xp - Cx) + (yp - Cy) * (Ax - Cx);
                    if (gb * s < 0) continue;
                    const gc = z - (ga + gb);
                    if (gc * s < 0) continue;
                    const idx = x + width * y;
                    W[idx] = mix(va, ga / z, vb, gb / z, vc, gc / z, x, y);
                    S[idx] = 1;
                }
            }
        }
        extrapolateBarycentric(W, S, X, Y, V, width, height, hull, index, mix);
        return W;
    };
}

function extrapolateBarycentric(
    W: any[],
    S: Uint8Array,
    X: Float64Array,
    Y: Float64Array,
    V: ArrayLike<any>,
    width: number,
    height: number,
    hull: Uint32Array,
    index: number[],
    mix: ReturnType<typeof mixer>
) {
    const hX = Float64Array.from(hull, (i) => X[index[i]]);
    const hY = Float64Array.from(hull, (i) => Y[index[i]]);
    const hV = Array.from(hull, (i) => V[index[i]]);
    const n = hX.length;
    const rays = Array.from({ length: n }, (_, j) => ray(j, hX, hY));
    let k = 0;
    for (let y = 0; y < height; ++y) {
        const yp = y + 0.5;
        for (let x = 0; x < width; ++x) {
            const i = x + width * y;
            if (!S[i]) {
                const xp = x + 0.5;
                for (let l = 0; l < n; ++l) {
                    const j = (n + k + (l % 2 ? (l + 1) / 2 : -l / 2)) % n;
                    if (rays[j](xp, yp)) {
                        const t = segmentProject(
                            at(hX, j - 1),
                            at(hY, j - 1),
                            hX[j],
                            hY[j],
                            xp,
                            yp
                        );
                        W[i] = mix(at(hV, j - 1), t, hV[j], 1 - t, hV[j], 0, x, y);
                        k = j;
                        break;
                    }
                }
            }
        }
    }
}

/**
 * Walk-on-spheres algorithm for smooth interpolation.
 * https://observablehq.com/@observablehq/walk-on-spheres-precision
 */
export function interpolatorRandomWalk({
    random = randomLcg(42),
    minDistance = 0.5,
    maxSteps = 2
} = {}): InterpolateFunction {
    return (index, width, height, X, Y, V) => {
        const n = width * height;
        const W: any = isTypedArray(V) ? new (V as any).constructor(n) : new Array(n);
        const delaunay = Delaunay.from(
            index,
            (i: number) => X[i],
            (i: number) => Y[i]
        );
        let iy: number | undefined, ix: number | undefined, iw: number | undefined;
        for (let y = 0.5, k = 0; y < height; ++y) {
            ix = iy;
            for (let x = 0.5; x < width; ++x, ++k) {
                let cx = x;
                let cy = y;
                iw = ix = delaunay.find(cx, cy, ix);
                if (x === 0.5) iy = ix;
                let distance: number;
                let step = 0;
                while (
                    (distance = Math.hypot(X[index[iw!]] - cx, Y[index[iw!]] - cy)) > minDistance &&
                    step < maxSteps
                ) {
                    const angle = (random as any)(x, y, step) * 2 * Math.PI;
                    cx += Math.cos(angle) * distance;
                    cy += Math.sin(angle) * distance;
                    iw = delaunay.find(cx, cy, iw);
                    ++step;
                }
                W[k] = V[index[iw!]];
            }
        }
        return W;
    };
}

// --- Internal helpers ---

function blend(a: any, ca: number, b: any, cb: number, c: any, cc: number): any {
    return ca * a + cb * b + cc * c;
}

function pick(random: (x: number, y: number) => number) {
    return (a: any, ca: number, b: any, cb: number, c: any, _cc: number, x: number, y: number) => {
        const u = random(x, y);
        return u < ca ? a : u < ca + cb ? b : c;
    };
}

function mixer(V: ArrayLike<any>, random: (...args: any[]) => number) {
    const first = findFirst(V);
    return typeof first === 'number' || first instanceof Date ? blend : pick(random as any);
}

function findFirst(V: ArrayLike<any>): any {
    for (let i = 0; i < V.length; ++i) if (V[i] != null) return V[i];
    return undefined;
}

function isTypedArray(V: ArrayLike<any>): boolean {
    return ArrayBuffer.isView(V) && !(V instanceof DataView);
}

function at<T>(arr: ArrayLike<T>, i: number): T {
    return arr[(i + arr.length) % arr.length];
}

function segmentProject(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x: number,
    y: number
): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const a = dx * (x2 - x) + dy * (y2 - y);
    const b = dx * (x - x1) + dy * (y - y1);
    return a > 0 && b > 0 ? a / (a + b) : +(a > b);
}

function cross(xa: number, ya: number, xb: number, yb: number): number {
    return xa * yb - xb * ya;
}

function ray(j: number, X: Float64Array, Y: Float64Array) {
    const n = X.length;
    const xc = at(X, j - 2);
    const yc = at(Y, j - 2);
    const xa = at(X, j - 1);
    const ya = at(Y, j - 1);
    const xb = X[j];
    const yb = Y[j];
    const xd = at(X, j + 1 - n);
    const yd = at(Y, j + 1 - n);
    const dxab = xa - xb;
    const dyab = ya - yb;
    const dxca = xc - xa;
    const dyca = yc - ya;
    const dxbd = xb - xd;
    const dybd = yb - yd;
    const hab = Math.hypot(dxab, dyab);
    const hca = Math.hypot(dxca, dyca);
    const hbd = Math.hypot(dxbd, dybd);
    return (x: number, y: number) => {
        const dxa = x - xa;
        const dya = y - ya;
        const dxb = x - xb;
        const dyb = y - yb;
        return (
            cross(dxa, dya, dxb, dyb) > -1e-6 &&
            cross(dxa, dya, dxab, dyab) * hca - cross(dxa, dya, dxca, dyca) * hab > -1e-6 &&
            cross(dxb, dyb, dxbd, dybd) * hab - cross(dxb, dyb, dxab, dyab) * hbd <= 0
        );
    };
}
