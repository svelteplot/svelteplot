import { describe, it, expect } from 'vitest';
import { dodgeX, dodgeY } from './dodge.js';

type Pt = { x: number; y: number; r?: number };

function mockPlotState({
    marginLeft = 10,
    marginRight = 0,
    marginTop = 5,
    marginBottom = 5,
    facetWidth = 100,
    facetHeight = 80
} = {}) {
    // Only the below fields are used by the anchor helpers in dodge.ts
    return {
        facetWidth,
        facetHeight,
        options: { marginLeft, marginRight, marginTop, marginBottom }
    } as any;
}

describe('dodge transforms', () => {
    it('dodgeX returns original data if no option provided', () => {
        const data: Pt[] = [
            { x: 0, y: 50 },
            { x: 0, y: 50 }
        ];
        const plot = mockPlotState();
        const out = dodgeX({ data }, plot);
        expect(out).toBe(data);
    });

    it('dodgeX with anchor="left" spreads horizontally from left margin', () => {
        const data: Pt[] = [
            { x: 0, y: 50 },
            { x: 0, y: 50 },
            { x: 0, y: 50 }
        ];
        const plot = mockPlotState({ marginLeft: 10 });
        const r = 2;
        const padding = 0;
        const out = dodgeX({ data, dodgeX: { anchor: 'left', r, padding } }, plot);

        // Expect consecutive placements at: marginLeft + (r + padding) + k * (2r)
        expect(out.map((d) => d.x)).toEqual([12, 16, 20]);
        // y should remain unchanged
        expect(out.map((d) => d.y)).toEqual([50, 50, 50]);
    });

    it('dodgeX with anchor="right" spreads horizontally from right edge', () => {
        const data: Pt[] = [
            { x: 0, y: 50 },
            { x: 0, y: 50 },
            { x: 0, y: 50 }
        ];
        const plot = mockPlotState({ marginLeft: 10, facetWidth: 100 });
        const r = 2;
        const padding = 0;
        const out = dodgeX({ data, dodgeX: { anchor: 'right', r, padding } }, plot);

        // Right edge baseline is marginLeft + facetWidth
        // Expect placements at baseline - (r + padding) - k * (2r)
        expect(out.map((d) => d.x)).toEqual([108, 104, 100]);
        expect(out.map((d) => d.y)).toEqual([50, 50, 50]);
    });

    it('dodgeX with anchor="middle" places around center', () => {
        const data: Pt[] = [
            { x: 0, y: 50 },
            { x: 0, y: 50 },
            { x: 0, y: 50 }
        ];
        const plot = mockPlotState({ marginLeft: 10, facetWidth: 100 });
        const r = 2;
        const padding = 0;
        const out = dodgeX({ data, dodgeX: { anchor: 'middle', r, padding } }, plot);

        // Center baseline is marginLeft + facetWidth/2 = 60
        expect(out[0].x).toBe(60);
        expect(out.map((d) => d.x).sort((a, b) => a - b)).toEqual([56, 60, 64]);
        expect(out.map((d) => d.y)).toEqual([50, 50, 50]);
    });

    it('dodgeY with anchor="bottom" spreads vertically from bottom edge', () => {
        const data: Pt[] = [
            { x: 20, y: 0 },
            { x: 20, y: 0 },
            { x: 20, y: 0 }
        ];
        const plot = mockPlotState({ facetHeight: 80 });
        const r = 2;
        const padding = 0;
        const out = dodgeY({ data, dodgeY: { anchor: 'bottom', r, padding } }, plot);

        // Bottom baseline is facetHeight, placements go upward
        expect(out.map((d) => d.y)).toEqual([78, 74, 70]);
        // x should remain unchanged
        expect(out.map((d) => d.x)).toEqual([20, 20, 20]);
    });

    it('dodgeY with anchor="middle" places around vertical center', () => {
        const data: Pt[] = [
            { x: 20, y: 0 },
            { x: 20, y: 0 },
            { x: 20, y: 0 }
        ];
        const plot = mockPlotState({ marginTop: 5, facetHeight: 80 });
        const r = 2;
        const padding = 0;
        const out = dodgeY({ data, dodgeY: { anchor: 'middle', r, padding } }, plot);

        // Vertical center baseline is (marginTop + height)/2 = 42.5
        expect(out[0].y).toBe(42.5);
        expect(out.map((d) => d.y).sort((a, b) => a - b)).toEqual([38.5, 42.5, 46.5]);
        expect(out.map((d) => d.x)).toEqual([20, 20, 20]);
    });

    it('dodgeX respects per-point radius via r channel', () => {
        const data: Pt[] = [
            { x: 0, y: 50, r: 2 },
            { x: 0, y: 50, r: 4 },
            { x: 0, y: 50, r: 2 }
        ];
        const plot = mockPlotState({ marginLeft: 10 });
        const padding = 0;
        // Provide r channel to use per-point radii
        const out = dodgeX({ data, r: 'r', dodgeX: { anchor: 'left', padding } }, plot);

        // With radii [2,4,2], placements from left baseline should be:
        // 10 + 2 = 12, then +6 = 18, then +6 = 24
        expect(out.map((d) => d.x)).toEqual([12, 18, 24]);
    });

    it('dodgeY respects per-point radius via r channel', () => {
        const data: Pt[] = [
            { x: 20, y: 0, r: 2 },
            { x: 20, y: 0, r: 4 },
            { x: 20, y: 0, r: 2 }
        ];
        const plot = mockPlotState({ facetHeight: 80 });
        const padding = 0;
        const out = dodgeY({ data, r: 'r', dodgeY: { anchor: 'bottom', padding } }, plot);

        // From bottom baseline (80) with radii [2,4,2] -> [78, 72, 66]
        expect(out.map((d) => d.y)).toEqual([78, 72, 66]);
    });
});
