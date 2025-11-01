import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import AreaYTest from './areaY.test.svelte';

describe('AreaY mark', () => {
    it('simple area (single series)', () => {
        const { container } = render(AreaYTest, {
            props: {
                plotArgs: {},
                areaArgs: {
                    data: [1, 2, 3]
                }
            }
        });

        const areas = container.querySelectorAll('path.area') as NodeListOf<SVGPathElement>;
        expect(areas.length).toBe(1);

        // Expected path for width=100, height=100, axes=false with default scales
        // Domain is [0, 3] -> y: 0 -> 95, 1 -> 65, 2 -> 35, 3 -> 5
        // x index positions -> ~1, 48.5, 96
        const d = areas[0]?.getAttribute('d');
        expect(d).toBe('M1,65L48.5,35L96,5L96,95L48.5,95L1,95Z');
    });

    it('two stacked areas (by fill)', () => {
        const data = [
            { x: 0, y: 1, g: 'A' },
            { x: 1, y: 2, g: 'A' },
            { x: 0, y: 2, g: 'B' },
            { x: 1, y: 1, g: 'B' }
        ];

        const { container } = render(AreaYTest, {
            props: {
                plotArgs: {},
                areaArgs: {
                    data,
                    x: 'x',
                    y: 'y',
                    fill: 'g'
                }
            }
        });

        const areas = Array.from(
            container.querySelectorAll('path.area') as NodeListOf<SVGPathElement>
        );
        expect(areas.length).toBe(2);

        // With totals max=3 -> y: 0->95, 1->65, 2->35, 3->5
        // Series A (baseline 0): M1,65 L96,35 L96,95 L1,95 Z
        // Series B (stacked on top of A): M1,5 L96,5 L96,35 L1,65 Z
        const d0 = areas[0]?.getAttribute('d');
        const d1 = areas[1]?.getAttribute('d');
        expect(d0).toBe('M1,65L96,35L96,95L1,95Z');
        expect(d1).toBe('M1,5L96,5L96,35L1,65Z');

        // Verify different colors for the two stacked areas
        const fill0 = areas[0].style.fill;
        const fill1 = areas[1].style.fill;
        expect(fill0).not.toBe('');
        expect(fill1).not.toBe('');
        expect(fill0).not.toBe(fill1);
    });

    it('applies class and areaClass props', () => {
        const { container } = render(AreaYTest, {
            props: {
                plotArgs: {},
                areaArgs: {
                    data: [
                        { x: 0, y: 1, g: 'A' },
                        { x: 1, y: 2, g: 'A' },
                        { x: 0, y: 2, g: 'B' },
                        { x: 1, y: 1, g: 'B' }
                    ],
                    x: 'x',
                    y: 'y',
                    fill: 'g',
                    class: 'my-area-group',
                    areaClass: (d) => `my-area-${d.g}`
                }
            }
        });

        // GroupMultiple wraps with <g class="my-area-group"> when class is provided
        const group = container.querySelector('g.my-area-group');
        expect(group).not.toBeNull();

        const areas = Array.from(
            container.querySelectorAll('path.area') as NodeListOf<SVGPathElement>
        );
        expect(areas.length).toBe(2);

        // Path should include the base 'area' class and the custom 'my-area' class
        const areaPath = container.querySelector('path.area') as SVGPathElement;
        expect(areaPath).not.toBeNull();
        expect(areas[0].classList.contains('area')).toBe(true);
        expect(areas[0].classList.contains('my-area-A')).toBe(true);
        expect(areas[1].classList.contains('area')).toBe(true);
        expect(areas[1].classList.contains('my-area-B')).toBe(true);
    });
});
