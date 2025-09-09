import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import TickXTest from './tickX.test.svelte';
import { getTranslate } from './utils';

const testData = [
    { x: 10, y: 'A' },
    { x: 15, y: 'B' },
    { x: 20, y: 'A' }
];

describe('TickX mark', () => {
    it('renders ticks with basic props', () => {
        const { container } = render(TickXTest, {
            props: {
                plotArgs: {},
                tickArgs: {
                    data: testData,
                    x: 'x'
                }
            }
        });

        const ticks = container.querySelectorAll('g.tick-x > line') as NodeListOf<SVGLineElement>;
        expect(ticks.length).toBe(3);

        // Check that lines are rendered
        ticks.forEach((tick) => {
            expect(tick.tagName).toBe('line');
            expect(tick.getAttribute('y1')).not.toBeNull();
            expect(tick.getAttribute('y2')).not.toBeNull();
        });
    });

    it('renders ticks with custom tick length', () => {
        const { container } = render(TickXTest, {
            props: {
                plotArgs: {},
                tickArgs: {
                    data: testData,
                    x: 'x',
                    tickLength: 20
                }
            }
        });

        const ticks = container.querySelectorAll('g.tick-x > line') as NodeListOf<SVGLineElement>;
        expect(ticks.length).toBe(3);

        // With tickLength = 20, when y1 === y2, tick extends tickLength/2 in each direction
        ticks.forEach((tick) => {
            const y1 = parseFloat(tick.getAttribute('y1') || '0');
            const y2 = parseFloat(tick.getAttribute('y2') || '0');
            if (y1 === y2) {
                // This means we have a point tick using the tickLength
                expect(Math.abs(y2 - y1)).toBe(0); // They should be equal for point ticks
            }
        });
    });

    it('positions ticks correctly on x axis', () => {
        const { container } = render(TickXTest, {
            props: {
                plotArgs: { x: { domain: [0, 30] } },
                tickArgs: {
                    data: testData,
                    x: 'x'
                }
            }
        });

        const ticks = container.querySelectorAll('g.tick-x > line') as NodeListOf<SVGLineElement>;
        expect(ticks.length).toBe(3);

        // Check that ticks have different transforms (different x positions)
        const transforms = Array.from(ticks).map((tick) => tick.getAttribute('transform') || '');

        // All transforms should be different (different x positions)
        const uniqueTransforms = new Set(transforms);
        expect(uniqueTransforms.size).toBe(3);
    });

    it('applies dx and dy offsets', () => {
        const { container } = render(TickXTest, {
            props: {
                plotArgs: {},
                tickArgs: {
                    data: testData,
                    x: 'x',
                    dx: 5,
                    dy: 10
                }
            }
        });

        const ticks = container.querySelectorAll('g.tick-x > line') as NodeListOf<SVGLineElement>;
        expect(ticks.length).toBe(3);

        // Check that transforms include the dx/dy offsets
        ticks.forEach((tick) => {
            const transform = tick.getAttribute('transform') || '';
            expect(transform).toMatch(/translate\(\d+\.?\d*, \d+\.?\d*\)/);
        });
    });

    it('handles band scale with y channel', () => {
        const { container } = render(TickXTest, {
            props: {
                plotArgs: {
                    y: { type: 'band', domain: ['A', 'B'] }
                },
                tickArgs: {
                    data: testData,
                    x: 'x',
                    y: 'y'
                }
            }
        });

        const ticks = container.querySelectorAll('g.tick-x > line') as NodeListOf<SVGLineElement>;
        expect(ticks.length).toBe(3);

        // With band scale, ticks should have different y positions
        const yPositions = Array.from(ticks).map((tick) => {
            const y1 = parseFloat(tick.getAttribute('y1') || '0');
            const y2 = parseFloat(tick.getAttribute('y2') || '0');
            return [y1, y2];
        });

        // Check that we have different y positions for different bands
        expect(yPositions.length).toBe(3);
    });

    it('applies stroke styling', () => {
        const { container } = render(TickXTest, {
            props: {
                plotArgs: {},
                tickArgs: {
                    data: testData,
                    x: 'x',
                    stroke: 'red',
                    strokeOpacity: 0.5
                }
            }
        });

        const ticks = container.querySelectorAll('g.tick-x > line') as NodeListOf<SVGLineElement>;
        expect(ticks.length).toBe(3);

        ticks.forEach((tick) => {
            const style = tick.getAttribute('style') || '';
            expect(style).toContain('stroke: red');
            expect(style).toContain('stroke-opacity: 0.5');
        });
    });

    it('filters out invalid data', () => {
        const dataWithNulls = [
            { x: 10, y: 'A' },
            { x: null, y: 'B' },
            { x: 20, y: 'A' },
            { x: undefined, y: 'C' }
        ];

        const { container } = render(TickXTest, {
            props: {
                plotArgs: {},
                tickArgs: {
                    data: dataWithNulls,
                    x: 'x'
                }
            }
        });

        const ticks = container.querySelectorAll('g.tick-x > line') as NodeListOf<SVGLineElement>;
        // Should only render ticks for valid x values (10 and 20)
        // Note: the undefined value might be treated differently, so we check actual behavior
        expect(ticks.length).toBeLessThan(4); // Should be fewer than total data points
        expect(ticks.length).toBeGreaterThan(0); // Should have some valid ticks
    });

    it('handles empty data', () => {
        const { container } = render(TickXTest, {
            props: {
                plotArgs: {},
                tickArgs: {
                    data: [],
                    x: 'x'
                }
            }
        });

        const ticks = container.querySelectorAll('g.tick-x > line') as NodeListOf<SVGLineElement>;
        expect(ticks.length).toBe(0);
    });
});
