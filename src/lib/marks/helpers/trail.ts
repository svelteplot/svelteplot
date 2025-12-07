import { TAU } from '$lib/constants.js';
import type { Path } from 'd3-path';

export type TrailContext = CanvasRenderingContext2D | Path;

export type TrailCurve = 'linear' | 'basis';
export type TrailCap = 'round' | 'butt';

export type TrailOptions = {
    curve?: TrailCurve;
    samplesPerSegment?: number;
    cap?: TrailCap;
};

export type TrailSample = { x: number; y: number; r: number };

/**
 * Draw a stroked capsule trail along successive points with varying widths.
 * Adapted from Vega's trail mark implementation.
 */
export function trailPath(
    samples: TrailSample[],
    defined: boolean[],
    context: TrailContext,
    options: TrailOptions = {}
): string | void {
    const { curve = 'linear', cap = 'round' } = options;
    const samplesPerSegment =
        options.samplesPerSegment ?? estimateSamplesPerSegment(samples, defined);

    let drawSamples = samples;
    let drawDefined = defined;

    if (curve === 'basis') {
        const smoothedSamples: TrailSample[] = [];
        const smoothedDefined: boolean[] = [];

        const len = Math.min(samples.length, defined.length);
        let i = 0;

        while (i < len) {
            if (!defined[i]) {
                smoothedSamples.push(samples[i]);
                smoothedDefined.push(false);
                i += 1;
                continue;
            }

            const segment: TrailSample[] = [];

            while (i < len && defined[i]) {
                segment.push(samples[i]);
                i += 1;
            }

            const resampled = resampleBasis(segment, Math.max(1, samplesPerSegment));
            smoothedSamples.push(...resampled);
            smoothedDefined.push(...new Array(resampled.length).fill(true));

            // preserve a gap between defined segments
            if (i < len) {
                smoothedSamples.push(samples[i]);
                smoothedDefined.push(false);
            }
        }

        drawSamples = smoothedSamples;
        drawDefined = smoothedDefined;
    }

    const len = Math.min(drawSamples.length, drawDefined.length);
    if (len === 0) return;

    // Butt caps: build joined polygon offsets using angle bisectors to avoid gaps.
    if (cap === 'butt') {
        const normalizeVec = (x: number, y: number): [number, number] => {
            const lenVec = Math.hypot(x, y);
            return lenVec === 0 ? [0, 0] : [x / lenVec, y / lenVec];
        };

        let i = 0;
        while (i < len) {
            if (!drawDefined[i]) {
                i += 1;
                continue;
            }

            const runStart = i;
            while (i < len && drawDefined[i]) i += 1;
            const runEnd = i - 1;

            const left: Array<[number, number]> = [];
            const right: Array<[number, number]> = [];

            for (let j = runStart; j <= runEnd; j += 1) {
                const curr = drawSamples[j];
                const r = curr.r;
                const hasPrev = j > runStart;
                const hasNext = j < runEnd;

                const prev = hasPrev ? drawSamples[j - 1] : curr;
                const next = hasNext ? drawSamples[j + 1] : curr;

                const dirPrev = hasPrev
                    ? normalizeVec(curr.x - prev.x, curr.y - prev.y)
                    : normalizeVec(next.x - curr.x, next.y - curr.y);
                const dirNext = hasNext
                    ? normalizeVec(next.x - curr.x, next.y - curr.y)
                    : dirPrev;

                const normPrev: [number, number] = [-dirPrev[1], dirPrev[0]];
                const normNext: [number, number] = [-dirNext[1], dirNext[0]];

                let nx = normPrev[0] + normNext[0];
                let ny = normPrev[1] + normNext[1];
                const nLen = Math.hypot(nx, ny);

                if (nLen < 1e-6) {
                    // Straight/180-deg turn: fall back to current normal.
                    nx = normPrev[0];
                    ny = normPrev[1];
                } else {
                    nx /= nLen;
                    ny /= nLen;
                }

                // Scale to preserve half-width along the miter direction.
                const dot = nx * normPrev[0] + ny * normPrev[1];
                const safeDot = Math.abs(dot) < 1e-6 ? 1 : dot;
                const scale = r / safeDot;
                const ox = nx * scale;
                const oy = ny * scale;

                left.push([curr.x + ox, curr.y + oy]);
                right.push([curr.x - ox, curr.y - oy]);
            }

            if (left.length > 0) {
                context.moveTo(left[0][0], left[0][1]);
                for (let j = 1; j < left.length; j += 1) {
                    context.lineTo(left[j][0], left[j][1]);
                }
                for (let j = right.length - 1; j >= 0; j -= 1) {
                    context.lineTo(right[j][0], right[j][1]);
                }
                context.closePath();
            }
        }

        return typeof context.toString === 'function' ? context.toString() : undefined;
    }

    // Round caps: original capsule behavior.
    let ready = false;
    let x1 = 0;
    let y1 = 0;
    let r1 = 0;

    function point(
        x2: number,
        y2: number,
        r2: number,
        isStartOfRun: boolean,
        isEndOfRun: boolean
    ) {
        if (ready) {
            let ux = y1 - y2;
            let uy = x2 - x1;

            if (ux || uy) {
                // compute normal vector scaled by radius
                const ud = Math.hypot(ux, uy);
                const rx = (ux /= ud) * r1;
                const ry = (uy /= ud) * r1;
                const t = Math.atan2(uy, ux);

                // keep rounded joins for interior segments even when using butt caps
                const drawStartCap = !isStartOfRun || cap === 'round';
                const drawEndCap = !isEndOfRun || cap === 'round';

                context.moveTo(x1 - rx, y1 - ry);
                context.lineTo(x2 - ux * r2, y2 - uy * r2);
                if (drawEndCap) {
                    context.arc(x2, y2, r2, t - Math.PI, t);
                } else {
                    context.lineTo(x2 + ux * r2, y2 + uy * r2);
                }
                context.lineTo(x1 + rx, y1 + ry);
                if (drawStartCap) {
                    context.arc(x1, y1, r1, t, t + Math.PI);
                }
            } else {
                if (cap === 'round' || (!isStartOfRun && !isEndOfRun)) {
                    context.arc(x2, y2, r2, 0, TAU);
                }
            }
            context.closePath();
        } else {
            ready = true;
        }
        x1 = x2;
        y1 = y2;
        r1 = r2;
    }

    let i = 0;
    while (i < len) {
        // Skip gaps
        if (!drawDefined[i]) {
            i += 1;
            ready = false;
            continue;
        }

        const runStart = i;
        while (i < len && drawDefined[i]) i += 1;
        const runEnd = i - 1;

        // Prime the first point of the run
        const first = drawSamples[runStart];
        ready = false;
        x1 = first.x;
        y1 = first.y;
        r1 = first.r;
        ready = true;

        for (let j = runStart + 1; j <= runEnd; j += 1) {
            const { x: x2, y: y2, r } = drawSamples[j];
            const isStart = j - 1 === runStart;
            const isEnd = j === runEnd;
            point(Number(x2), Number(y2), Number(r), isStart, isEnd);
        }

        ready = false;
    }

    return typeof context.toString === 'function' ? context.toString() : undefined;
}

function resampleBasis(points: TrailSample[], samplesPerSegment: number): TrailSample[] {
    const result: TrailSample[] = [];

    if (points.length === 0) return result;

    const n = points.length;
    result.push(points[0]);

    for (let i = 0; i < n - 1; i += 1) {
        const p0 = i === 0 ? points[0] : points[i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = i + 2 < n ? points[i + 2] : points[i + 1];
        const r1 = points[i].r;
        const r2 = points[i + 1].r;

        for (let step = 1; step <= samplesPerSegment; step += 1) {
            const t = step / samplesPerSegment;
            const { x, y } = catmullRom(p0, p1, p2, p3, t);
            result.push({ x, y, r: lerp(r1, r2, t) });
        }
    }

    return result;
}

function catmullRom(
    p0: TrailSample,
    p1: TrailSample,
    p2: TrailSample,
    p3: TrailSample,
    t: number
): { x: number; y: number } {
    const t2 = t * t;
    const t3 = t2 * t;
    const x =
        0.5 *
        (2 * p1.x +
            (-p0.x + p2.x) * t +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
    const y =
        0.5 *
        (2 * p1.y +
            (-p0.y + p2.y) * t +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
    return { x, y };
}

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

function estimateSamplesPerSegment(samples: TrailSample[], defined: boolean[]): number {
    const n = Math.min(samples.length, defined.length);
    let distSum = 0;
    let distCount = 0;
    let rSum = 0;
    let rCount = 0;

    for (let i = 0; i < n; i++) {
        if (defined[i]) {
            rSum += samples[i].r;
            rCount += 1;
        }
        if (i === 0 || !defined[i] || !defined[i - 1]) continue;
        const dx = samples[i].x - samples[i - 1].x;
        const dy = samples[i].y - samples[i - 1].y;
        const d = Math.hypot(dx, dy);
        if (isFinite(d) && d > 0) {
            distSum += d;
            distCount += 1;
        }
    }

    const meanDist = distCount ? distSum / distCount : 0;
    const meanRadius = rCount ? rSum / rCount : 0;
    const base = meanRadius > 0 ? meanDist / meanRadius : meanDist;

    // Keep within a reasonable range to avoid excessive subdivision.
    return Math.max(1, Math.min(32, Math.round(base || 1)));
}

export default trailPath;
