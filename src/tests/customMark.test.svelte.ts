import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
// @ts-expect-error - Svelte component has no typed default export
import CustomMarkTest from './customMark.test.svelte';

const data = [
    { x: 10, y: 20, size: 5 },
    { x: 50, y: 60, size: 15 },
    { x: 80, y: 40, size: 10 }
];

describe('CustomMark', () => {
    it('mark snippet renders one circle per datum', () => {
        const { container } = render(CustomMarkTest, {
            props: { data, x: 'x', y: 'y' }
        });

        const circles = container.querySelectorAll('circle.custom-circle');
        expect(circles.length).toBe(data.length);
    });

    it('marks snippet renders one rect per datum', () => {
        const { container } = render(CustomMarkTest, {
            props: { data, x: 'x', y: 'y', mode: 'marks' }
        });

        const rects = container.querySelectorAll('rect.custom-rect');
        expect(rects.length).toBe(data.length);
    });

    it('x/y coordinates are scaled to pixel space', () => {
        const { container } = render(CustomMarkTest, {
            props: { data, x: 'x', y: 'y' }
        });

        const circles = container.querySelectorAll('circle.custom-circle');
        for (const circle of circles) {
            const x = Number(circle.getAttribute('data-x'));
            const y = Number(circle.getAttribute('data-y'));
            expect(x).not.toBeNaN();
            expect(y).not.toBeNaN();
            expect(x).toBeGreaterThanOrEqual(0);
            expect(x).toBeLessThanOrEqual(100);
            expect(y).toBeGreaterThanOrEqual(0);
            expect(y).toBeLessThanOrEqual(100);
        }
    });

    it('data-driven fill channel', () => {
        const { container } = render(CustomMarkTest, {
            props: {
                data,
                x: 'x',
                y: 'y',
                fill: (d: (typeof data)[0]) => (d.x > 50 ? 'red' : 'blue')
            }
        });

        const circles = container.querySelectorAll('circle.custom-circle');
        const fills = Array.from(circles).map((c) => c.getAttribute('data-fill'));
        expect(fills).toEqual(['blue', 'blue', 'red']);
    });

    it('constant stroke channel', () => {
        const { container } = render(CustomMarkTest, {
            props: { data, x: 'x', y: 'y', stroke: 'green' }
        });

        const circles = container.querySelectorAll('circle.custom-circle');
        for (const circle of circles) {
            expect(circle.getAttribute('data-stroke')).toBe('green');
        }
    });

    it('r channel is scaled', () => {
        const { container } = render(CustomMarkTest, {
            props: { data, x: 'x', y: 'y', r: 'size' }
        });

        const circles = container.querySelectorAll('circle.custom-circle');
        expect(circles.length).toBe(data.length);
        for (const circle of circles) {
            const r = Number(circle.getAttribute('data-r'));
            expect(r).not.toBeNaN();
            expect(r).toBeGreaterThan(0);
        }
    });

    it('default data renders exactly 1 element', () => {
        const { container } = render(CustomMarkTest, {
            props: {}
        });

        const circles = container.querySelectorAll('circle.custom-circle');
        expect(circles.length).toBe(1);
    });

    it('empty data renders no elements', () => {
        const { container } = render(CustomMarkTest, {
            props: { data: [] }
        });

        const circles = container.querySelectorAll('circle.custom-circle');
        expect(circles.length).toBe(0);
    });

    it('x1/x2/y1/y2 range channels', () => {
        const { container } = render(CustomMarkTest, {
            props: { data: [{ a: 1 }], x1: 10, x2: 80, y1: 20, y2: 60 }
        });

        const circles = container.querySelectorAll('circle.custom-circle');
        expect(circles.length).toBe(1);

        const circle = circles[0];
        const x1 = Number(circle.getAttribute('data-x1'));
        const x2 = Number(circle.getAttribute('data-x2'));
        const y1 = Number(circle.getAttribute('data-y1'));
        const y2 = Number(circle.getAttribute('data-y2'));

        expect(x1).not.toBeNaN();
        expect(x2).not.toBeNaN();
        expect(y1).not.toBeNaN();
        expect(y2).not.toBeNaN();
    });
});
