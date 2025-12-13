import { describe, it, expect } from 'vitest';
import { path } from 'd3-path';
import { trailPath, type TrailSample } from './trail.js';

const straightRun: TrailSample[] = [
    { x: 0, y: 0, r: 1 },
    { x: 2, y: 0, r: 1 }
];

describe('trailPath', () => {
    it('draws a round-capped capsule for a straight segment', () => {
        const ctx = path();
        const expected = 'M0,-1L2,-1A1,1,0,1,1,2,1L0,1A1,1,0,1,1,-1.8369701987210297e-16,-1Z';

        const result = trailPath(straightRun, [true, true], ctx, {
            curve: 'linear',
            tension: 0,
            samplesPerSegment: 1,
            cap: 'round'
        });

        expect(result).toBe(ctx.toString());
        expect(result).toBe(expected);
    });

    it('butt-capped capsule', () => {
        const ctx = path();

        const result = trailPath(straightRun, [true, true], ctx, { cap: 'butt' });

        expect(result).toBe('M0,1L1,1L2,1L2,-1L1,-1L0,-1Z');
    });

    it('honors varying radii along a run with butt caps', () => {
        const samples: TrailSample[] = [
            { x: 0, y: 0, r: 1 },
            { x: 1, y: 0, r: 2 },
            { x: 2, y: 0, r: 3 }
        ];
        const ctx = path();

        const result = trailPath(samples, [true, true, true], ctx, {
            curve: 'linear',
            tension: 0,
            samplesPerSegment: 1,
            cap: 'butt'
        });

        expect(result).toBe('M0,1L1,2L2,3L2,-3L1,-2L0,-1Z');
    });

    it('interpolates a curved path across non-colinear points', () => {
        const samples: TrailSample[] = [
            { x: 0, y: 0, r: 0.75 },
            { x: 1, y: 1.5, r: 0.5 },
            { x: 2, y: 0, r: 0.75 }
        ];
        const ctx = path();

        const result = trailPath(samples, [true, true, true], ctx, {
            curve: 'catmull-rom',
            tension: 0.5,
            samplesPerSegment: 2,
            cap: 'butt'
        });

        expect(result).toBeTruthy();

        const numbers = (result?.match(/-?\d*\.?\d+(?:e-?\d+)?/g) ?? []).map(Number);
        const coords: Array<[number, number]> = [];
        for (let i = 0; i < numbers.length; i += 2) {
            coords.push([numbers[i], numbers[i + 1]]);
        }

        expect(coords.length).toBeGreaterThan(6); // resampled points on each side
        const interior = coords.slice(1, -1);
        const hasInterpolated = interior.some(
            ([x, y]) => ![0, 1, 2].includes(Number(x.toFixed(2))) || ![0, 1.5].includes(y)
        );
        expect(hasInterpolated).toBe(true);

        const xs = coords.map(([x]) => x);
        const ys = coords.map(([, y]) => y);
        expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(0);
        expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(0);
    });

    it('does not bridge gaps in the defined mask', () => {
        const samples: TrailSample[] = [
            { x: 0, y: 0, r: 1 },
            { x: 1, y: 0, r: 1 },
            { x: 2, y: 0, r: 1 },
            { x: 3, y: 0, r: 1 },
            { x: 4, y: 0, r: 1 }
        ];
        const defined = [true, true, false, true, true];
        const ctx = path();

        const result = trailPath(samples, defined, ctx, {
            curve: 'linear',
            tension: 0,
            samplesPerSegment: 1,
            cap: 'butt'
        });

        expect(result).toBe('M0,1L1,1L1,-1L0,-1ZM3,1L4,1L4,-1L3,-1Z');

        const moveCount = (result?.split('M').length ?? 0) - 1;
        expect(moveCount).toBe(2); // two separate runs
    });
});
