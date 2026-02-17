import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import VectorTest from './vector.test.svelte';

const data = [
    { x: 10, y: 20, len: 15, angle: 45 },
    { x: 50, y: 60, len: 25, angle: 90 },
    { x: 80, y: 40, len: 10, angle: 180 }
];

describe('Vector mark', () => {
    it('renders one path per datum', () => {
        const { container } = render(VectorTest, {
            props: { data, x: 'x', y: 'y', length: 'len', rotate: 'angle' }
        });

        const paths = container.querySelectorAll('g.vector path');
        expect(paths.length).toBe(data.length);
    });

    it('path has valid shape geometry', () => {
        const { container } = render(VectorTest, {
            props: { data, x: 'x', y: 'y', length: 'len', rotate: 'angle' }
        });

        const paths = container.querySelectorAll('g.vector path');
        for (const path of paths) {
            const d = path.getAttribute('d');
            expect(d).toContain('M');
            expect(d).toContain('L');
        }
    });

    it('path has translate transform', () => {
        const { container } = render(VectorTest, {
            props: { data, x: 'x', y: 'y', length: 'len', rotate: 'angle' }
        });

        const paths = container.querySelectorAll('g.vector path');
        for (const path of paths) {
            const transform = path.getAttribute('transform');
            expect(transform).toMatch(/translate\(/);
        }
    });

    it('applies custom stroke', () => {
        const { container } = render(VectorTest, {
            props: { data, x: 'x', y: 'y', length: 'len', rotate: 'angle', stroke: 'red' }
        });

        const paths = container.querySelectorAll('g.vector path');
        expect(paths.length).toBe(data.length);
        for (const path of paths) {
            expect((path as SVGElement).style.stroke).toBe('red');
        }
    });

    it('renders spike shape', () => {
        const { container } = render(VectorTest, {
            props: { data, x: 'x', y: 'y', length: 'len', shape: 'spike' }
        });

        const paths = container.querySelectorAll('g.vector path');
        expect(paths.length).toBe(data.length);
        for (const path of paths) {
            const d = path.getAttribute('d');
            expect(d).toBeTruthy();
            expect(d).toContain('M');
        }
    });

    it('renders arrow-filled shape with fill styling', () => {
        const { container } = render(VectorTest, {
            props: {
                data,
                x: 'x',
                y: 'y',
                length: 'len',
                shape: 'arrow-filled',
                fill: 'blue'
            }
        });

        const paths = container.querySelectorAll('g.vector path');
        expect(paths.length).toBe(data.length);
        for (const path of paths) {
            expect((path as SVGElement).style.fill).toBe('blue');
        }
    });

    it('respects anchor option', () => {
        const { container: startContainer } = render(VectorTest, {
            props: { data, x: 'x', y: 'y', length: 'len', anchor: 'start' }
        });

        const { container: middleContainer } = render(VectorTest, {
            props: { data, x: 'x', y: 'y', length: 'len', anchor: 'middle' }
        });

        const startPaths = startContainer.querySelectorAll('g.vector path');
        const middlePaths = middleContainer.querySelectorAll('g.vector path');

        // anchor: 'start' should NOT have the extra translate offset that 'middle' adds
        for (const path of startPaths) {
            const transform = path.getAttribute('transform')!;
            // 'start' produces: translate(x,y) rotate(deg) with no trailing translate
            const parts = transform.split(') ').filter((p) => p.startsWith('translate('));
            expect(parts.length).toBe(1); // only the positional translate
        }

        for (const path of middlePaths) {
            const transform = path.getAttribute('transform')!;
            // 'middle' produces: translate(x,y) rotate(deg) translate(0, length/2)
            expect(transform).toMatch(/translate\(0,/);
        }
    });

    it('handles empty data', () => {
        const { container } = render(VectorTest, {
            props: { data: [], x: 'x', y: 'y' }
        });

        const paths = container.querySelectorAll('g.vector path');
        expect(paths.length).toBe(0);
    });
});
