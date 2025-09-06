import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import GridYTest from './gridY.test.svelte';
import { tick } from 'svelte';

describe('GridY mark', () => {
    it('simple y grid with stroke styles', () => {
        const { container } = render(GridYTest, {
            props: {
                plotArgs: {
                    x: { domain: [0, 10] },
                    y: { domain: [0, 10] }
                },
                gridArgs: {
                    stroke: '#008000',
                    strokeOpacity: 0.5,
                    strokeDasharray: '5, 5',
                    data: [0, 5, 10]
                }
            }
        });
        const gridLines = container.querySelectorAll(
            'g.grid-y > line'
        ) as NodeListOf<SVGLineElement>;
        expect(gridLines.length).toBe(3);
        expect(gridLines[0].style.strokeDasharray).toBe('5, 5');
        expect(gridLines[0].style.stroke).toBe('#008000');
        expect(gridLines[0].style.strokeOpacity).toBe('0.5');
    });

    it('simple x grid with dx and dy', async () => {
        const props = $state({
            plotArgs: {
                x: { domain: [0, 10] },
                y: { domain: [0, 10] }
            },
            gridArgs: {
                dx: 0,
                dy: 0,
                data: [0, 5, 10]
            }
        });

        const { container } = render(GridYTest, {
            props
        });
        const gridLines = container.querySelectorAll(
            'g.grid-y > line'
        ) as NodeListOf<SVGLineElement>;
        expect(gridLines[0].getAttribute('transform')).toBe('translate(1,95)');

        props.gridArgs.dx = 10;
        await tick();

        const gridLines2 = container.querySelectorAll(
            'g.grid-y > line'
        ) as NodeListOf<SVGLineElement>;
        expect(gridLines2[0].getAttribute('transform')).toBe('translate(11,95)');

        const dy = vi.fn(() => -20);

        props.gridArgs.dy = dy;
        await tick();

        const gridLines3 = container.querySelectorAll(
            'g.grid-y > line'
        ) as NodeListOf<SVGLineElement>;
        expect(gridLines3[0].getAttribute('transform')).toBe('translate(11,75)');
        expect(dy).toHaveBeenCalled();
    });
});
