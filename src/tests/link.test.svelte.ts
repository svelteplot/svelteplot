import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import LinkTest from './link.test.svelte';

describe('Link mark', () => {
    it.each([
        { markerScale: 1, expected: 6.67 },
        { markerScale: 0.5, expected: 3.335 }
    ])('scales markers with markerScale=$markerScale', ({ markerScale, expected }) => {
        const { container } = render(LinkTest, {
            props: {
                data: [
                    { x1: 0, y1: 0, x2: 1, y2: 1 },
                    { x1: 0, y1: 1, x2: 1, y2: 0 }
                ],
                x1: 'x1',
                y1: 'y1',
                x2: 'x2',
                y2: 'y2',
                marker: 'circle',
                markerScale
            }
        });

        const marker = container.querySelector('marker');
        expect(marker).not.toBeNull();
        const width = Number.parseFloat(marker?.getAttribute('markerWidth') ?? '');
        expect(width).toBeCloseTo(expected, 3);
    });
});
