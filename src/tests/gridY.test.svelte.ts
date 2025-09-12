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
        const gridLines = container.querySelectorAll('g.grid-y > line');
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
        const gridLines = container.querySelectorAll('g.grid-y > line');
        expect(gridLines[0].getAttribute('transform')).toBe('translate(1,95)');

        props.gridArgs.dx = 10;
        await tick();

        const gridLines2 = container.querySelectorAll('g.grid-y > line');
        expect(gridLines2[0].getAttribute('transform')).toBe('translate(11,95)');

        const dy = vi.fn(() => -20);

        props.gridArgs.dy = dy;
        await tick();

        const gridLines3 = container.querySelectorAll('g.grid-y > line');
        expect(gridLines3[0].getAttribute('transform')).toBe('translate(11,75)');
        expect(dy).toHaveBeenCalled();
    });

    it('passes index to accessor functions', () => {
        const x1 = vi.fn((d, i) => d + i);
        const stroke = vi.fn((d, i) => 'gray');
        render(GridYTest, {
            props: {
                plotArgs: {
                    x: { domain: [0, 10] }
                },
                gridArgs: {
                    data: [0, 5, 10],
                    x1,
                    stroke
                }
            }
        });
        expect(x1).toHaveBeenCalled();
        expect(x1.mock.calls[0]).toStrictEqual([0, 0]);
        expect(x1.mock.calls[1]).toStrictEqual([5, 1]);
        expect(x1.mock.calls[2]).toStrictEqual([10, 2]);
        expect(stroke).toHaveBeenCalled();
        expect(stroke.mock.calls[0]).toStrictEqual([0, 0]);
        expect(stroke.mock.calls[1]).toStrictEqual([5, 1]);
        expect(stroke.mock.calls[2]).toStrictEqual([10, 2]);
    });
});
