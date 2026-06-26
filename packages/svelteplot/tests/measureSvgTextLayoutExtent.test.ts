import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { measureSvgTextLayoutExtent } from '../src/helpers/measureSvgTextLayoutExtent.js';

const SCALE = 1.3;
const BBOX = { x: 0, y: 0, width: 30, height: 12 };

function createTextElement(): SVGTextElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    svg.appendChild(text);
    document.body.appendChild(svg);
    return text;
}

describe('measureSvgTextLayoutExtent', () => {
    let text: SVGTextElement;

    beforeEach(() => {
        text = createTextElement();
        text.getBBox = vi.fn().mockReturnValue(BBOX as DOMRect);
        vi.spyOn(text, 'getBoundingClientRect').mockReturnValue({
            x: 0,
            y: 0,
            width: BBOX.width * SCALE,
            height: BBOX.height * SCALE,
            top: 0,
            left: 0,
            right: BBOX.width * SCALE,
            bottom: BBOX.height * SCALE,
            toJSON: () => ({})
        } as DOMRect);
    });

    afterEach(() => {
        text.parentElement?.remove();
        vi.restoreAllMocks();
    });

    it('T1: returns unscaled user-space dimension when gbcr is inflated', () => {
        expect(measureSvgTextLayoutExtent(text, 'width')).toBe(30);
        expect(measureSvgTextLayoutExtent(text, 'height')).toBe(12);
    });

    it('T3: returns raw bbox height when tick rotation is zero', () => {
        expect(measureSvgTextLayoutExtent(text, 'height')).toBe(BBOX.height);
    });

    it('T2: measures rotated tick height from bbox corners and local transform', () => {
        const rad = (45 * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        // SVG transform="translate(0, 5) rotate(45)" applies rotate first, then translate
        const matrix = { a: cos, b: sin, c: -sin, d: cos, e: 0, f: 5 };
        Object.defineProperty(text, 'transform', {
            value: { baseVal: { consolidate: () => ({ matrix }) } },
            configurable: true
        });

        const corners: [number, number][] = [
            [BBOX.x, BBOX.y],
            [BBOX.x + BBOX.width, BBOX.y],
            [BBOX.x, BBOX.y + BBOX.height],
            [BBOX.x + BBOX.width, BBOX.y + BBOX.height]
        ];
        const ys = corners.map(([x, y]) => sin * x + cos * y + matrix.f);
        const expectedHeight = Math.max(...ys) - Math.min(...ys);

        expect(measureSvgTextLayoutExtent(text, 'height')).toBeCloseTo(expectedHeight, 5);
        expect(measureSvgTextLayoutExtent(text, 'height')).toBeGreaterThan(BBOX.height);
    });

    it('T4: returns zero when getBBox throws', () => {
        text.getBBox = vi.fn().mockImplementation(() => {
            throw new Error('detached');
        });
        expect(measureSvgTextLayoutExtent(text, 'height')).toBe(0);
    });
});