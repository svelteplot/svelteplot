import { TAU } from '../../constants.js';
import type { Path } from 'd3-path';
import { maybeCurve } from '../../helpers/curves.js';
import type { CurveName } from '../../types/index.js';
import type { CurveBundleFactory, CurveFactory } from 'd3-shape';

export type TrailContext = CanvasRenderingContext2D | Path;

export type TrailCurve = CurveName | CurveFactory;
export type TrailCap = 'round' | 'butt';

export type TrailOptions = {
    curve?: TrailCurve;
    samplesPerSegment?: number;
    cap?: TrailCap;
    tension?: number;
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
    const { curve = 'linear', cap = 'round', tension = 0.5 } = options;
    const samplesPerSegment =
        options.samplesPerSegment ?? estimateSamplesPerSegment(samples, defined);
    const curveFactory = maybeCurve(curve, tension);

    let drawSamples = samples;
    let drawDefined = defined;

    if (curve !== 'linear' || tension !== 0) {
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

            const resampled = resampleCurve(segment, curveFactory, Math.max(1, samplesPerSegment));
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
                const dirNext = hasNext ? normalizeVec(next.x - curr.x, next.y - curr.y) : dirPrev;

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

    function point(x2: number, y2: number, r2: number, isStartOfRun: boolean, isEndOfRun: boolean) {
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

function resampleCurve(
    points: TrailSample[],
    curveFactory: CurveFactory | CurveBundleFactory,
    samplesPerSegment: number
): TrailSample[] {
    if (points.length === 0) return [];

    const commands: Command[] = [];
    let pendingRadius = points[0].r;
    let currentRadius = points[0].r;
    let currentPoint: [number, number] | null = null;

    const ctx: CurveContext = {
        beginPath() {},
        closePath() {},
        moveTo(x, y) {
            currentPoint = [x, y];
            currentRadius = pendingRadius;
            commands.push({ type: 'move', to: [x, y], r: currentRadius });
        },
        lineTo(x, y) {
            const from = currentPoint ?? [x, y];
            commands.push({
                type: 'line',
                from: [from[0], from[1], currentRadius],
                to: [x, y, pendingRadius]
            });
            currentPoint = [x, y];
            currentRadius = pendingRadius;
        },
        bezierCurveTo(x1, y1, x2, y2, x, y) {
            const from = currentPoint ?? [x, y];
            commands.push({
                type: 'cubic',
                from: [from[0], from[1], currentRadius],
                cp1: [x1, y1],
                cp2: [x2, y2],
                to: [x, y, pendingRadius]
            });
            currentPoint = [x, y];
            currentRadius = pendingRadius;
        },
        quadraticCurveTo(x1, y1, x, y) {
            const from = currentPoint ?? [x, y];
            commands.push({
                type: 'quad',
                from: [from[0], from[1], currentRadius],
                cp: [x1, y1],
                to: [x, y, pendingRadius]
            });
            currentPoint = [x, y];
            currentRadius = pendingRadius;
        },
        arc() {},
        rect() {}
    };

    const curve = curveFactory(ctx as unknown as CanvasRenderingContext2D);
    curve.lineStart();
    for (let idx = 0; idx < points.length; idx += 1) {
        const pt = points[idx];
        pendingRadius = pt.r;
        curve.point(pt.x, pt.y);
    }
    curve.lineEnd();

    const geom = flattenCommands(commands, samplesPerSegment);
    if (geom.length === 0) return geom;

    // Re-map radii along the resampled path using the original cumulative
    // length as the parameter to avoid curve-specific radius drift.
    const origCum: number[] = [0];
    for (let i = 1; i < points.length; i += 1) {
        const dx = points[i].x - points[i - 1].x;
        const dy = points[i].y - points[i - 1].y;
        origCum.push(origCum[i - 1] + Math.hypot(dx, dy));
    }
    const origTotal = origCum[origCum.length - 1] || 1;

    const resCum: number[] = [0];
    for (let i = 1; i < geom.length; i += 1) {
        const dx = geom[i].x - geom[i - 1].x;
        const dy = geom[i].y - geom[i - 1].y;
        resCum.push(resCum[i - 1] + Math.hypot(dx, dy));
    }
    const resTotal = resCum[resCum.length - 1] || 1;

    const radiusAt = (target: number) => {
        let idx = 1;
        while (idx < origCum.length && origCum[idx] < target) idx += 1;
        if (idx === origCum.length) return points[points.length - 1].r;
        const t0 = origCum[idx - 1];
        const t1 = origCum[idx];
        const r0 = points[idx - 1].r;
        const r1 = points[idx].r;
        const t = t1 === t0 ? 0 : (target - t0) / (t1 - t0);
        return lerp(r0, r1, t);
    };

    for (let i = 0; i < geom.length; i += 1) {
        const frac = resCum[i] / resTotal;
        geom[i].r = Number(radiusAt(frac * origTotal).toFixed(2));
    }

    return geom;
}

type Command =
    | { type: 'move'; to: [number, number]; r: number }
    | { type: 'line'; from: [number, number, number]; to: [number, number, number] }
    | {
          type: 'cubic';
          from: [number, number, number];
          cp1: [number, number];
          cp2: [number, number];
          to: [number, number, number];
      }
    | {
          type: 'quad';
          from: [number, number, number];
          cp: [number, number];
          to: [number, number, number];
      };

type CurveContext = {
    beginPath: () => void;
    closePath: () => void;
    moveTo: (x: number, y: number) => void;
    lineTo: (x: number, y: number) => void;
    bezierCurveTo: (x1: number, y1: number, x2: number, y2: number, x: number, y: number) => void;
    quadraticCurveTo: (x1: number, y1: number, x: number, y: number) => void;
    arc: () => void;
    rect: () => void;
};

function flattenCommands(
    commands: Command[],
    samplesPerSegment: number,
    precision = 2
): TrailSample[] {
    const result: TrailSample[] = [];
    let last: [number, number, number] | null = null;

    const round = (v: number) => {
        const m = 10 ** precision;
        return Math.round(v * m) / m;
    };

    const pushPoint = (x: number, y: number, r: number) => {
        x = round(x);
        y = round(y);
        r = round(r);
        if (!last || last[0] !== x || last[1] !== y || last[2] !== r) {
            result.push({ x, y, r });
            last = [x, y, r];
        }
    };

    for (const cmd of commands) {
        if (cmd.type === 'move') {
            pushPoint(cmd.to[0], cmd.to[1], cmd.r);
            continue;
        }
        if (cmd.type === 'line') {
            const [x1, y1, r1] = cmd.from;
            const [x2, y2, r2] = cmd.to;
            for (let step = 1; step <= samplesPerSegment; step += 1) {
                const t = step / samplesPerSegment;
                pushPoint(lerp(x1, x2, t), lerp(y1, y2, t), lerp(r1, r2, t));
            }
            continue;
        }
        if (cmd.type === 'cubic') {
            const [x0, y0, r0] = cmd.from;
            const [x1, y1] = cmd.cp1;
            const [x2, y2] = cmd.cp2;
            const [x3, y3, r3] = cmd.to;
            for (let step = 1; step <= samplesPerSegment; step += 1) {
                const t = step / samplesPerSegment;
                pushPoint(cubic(x0, x1, x2, x3, t), cubic(y0, y1, y2, y3, t), lerp(r0, r3, t));
            }
            continue;
        }
        if (cmd.type === 'quad') {
            const [x0, y0, r0] = cmd.from;
            const [cx, cy] = cmd.cp;
            const [x1, y1, r1] = cmd.to;
            for (let step = 1; step <= samplesPerSegment; step += 1) {
                const t = step / samplesPerSegment;
                pushPoint(quad(x0, cx, x1, t), quad(y0, cy, y1, t), lerp(r0, r1, t));
            }
        }
    }

    return result;
}

function cubic(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const it = 1 - t;
    return it * it * it * p0 + 3 * it * it * t * p1 + 3 * it * t * t * p2 + t * t * t * p3;
}

function quad(p0: number, p1: number, p2: number, t: number): number {
    const it = 1 - t;
    return it * it * p0 + 2 * it * t * p1 + t * t * p2;
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
