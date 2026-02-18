import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
// @ts-expect-error - Svelte component has no typed default export
import SpikeTest from './spike.test.svelte';

const data = [
    { x: 10, y: 20, len: 15 },
    { x: 50, y: 60, len: 25 },
    { x: 80, y: 40, len: 10 }
];

describe('Spike mark', () => {
    it('renders one path per datum', () => {
        const { container } = render(SpikeTest, {
            props: { data, x: 'x', y: 'y', length: 'len' }
        });

        const paths = container.querySelectorAll('g.vector path');
        expect(paths.length).toBe(data.length);
    });

    it('uses spike shape by default', () => {
        const { container } = render(SpikeTest, {
            props: { data, x: 'x', y: 'y', length: 'len' }
        });

        const paths = container.querySelectorAll('g.vector path');
        for (const path of paths) {
            const d = path.getAttribute('d');
            expect(d).toBeTruthy();
            expect(d).toContain('M');
            expect(d).toContain('L');
        }
    });

    it('applies default stroke', () => {
        const { container } = render(SpikeTest, {
            props: { data, x: 'x', y: 'y', length: 'len' }
        });

        const paths = container.querySelectorAll('g.vector path');
        expect(paths.length).toBe(data.length);
        for (const path of paths) {
            const style = (path as SVGElement).style;
            expect(style.stroke).toBeTruthy();
        }
    });

    it('applies custom stroke override', () => {
        const { container } = render(SpikeTest, {
            props: { data, x: 'x', y: 'y', length: 'len', stroke: 'green' }
        });

        const paths = container.querySelectorAll('g.vector path');
        expect(paths.length).toBe(data.length);
        for (const path of paths) {
            expect((path as SVGElement).style.stroke).toBe('green');
        }
    });

    it('handles empty data', () => {
        const { container } = render(SpikeTest, {
            props: { data: [], x: 'x', y: 'y' }
        });

        const paths = container.querySelectorAll('g.vector path');
        expect(paths.length).toBe(0);
    });
});
