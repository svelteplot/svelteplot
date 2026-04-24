import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
// @ts-ignore - svelte-check errors on .svelte imports, tsc does not
import GridXTest from './gridX.test.svelte';
import { tick } from 'svelte';

describe('GridX mark', () => {
    it('simple x grid with stroke styles', () => {
        const { container } = render(GridXTest, {
            props: {
                plotArgs: {
                    x: [0, 10],
                    y: [0, 10]
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
            'g.grid-x > line'
        ) as NodeListOf<SVGLineElement>;
        expect(gridLines.length).toBe(3);
        expect(gridLines[0].style.strokeDasharray).toBe('5, 5');
        expect(gridLines[0].style.stroke).toBe('#008000');
        expect(gridLines[0].style.strokeOpacity).toBe('0.5');
    });

    it('plot domain from grid data', () => {
        const { container } = render(GridXTest, {
            props: {
                plotArgs: {
                    y: { domain: [0, 10] }
                },
                gridArgs: {
                    data: [1, 5, 20]
                }
            }
        });
        const gridLines = container.querySelectorAll('g.grid-x > line');
        expect(gridLines[0].getAttribute('transform')).toBe('translate(1,0)');
        expect(gridLines[1].getAttribute('transform')).toBe('translate(21,0)');
        expect(gridLines[2].getAttribute('transform')).toBe('translate(96,0)');
        expect(gridLines.length).toBe(3);
    });

    it('simple x grid with dx and dy', async () => {
        const props = $state({
            plotArgs: {
                x: { domain: [0, 10] },
                y: { domain: [0, 10] }
            },
            gridArgs: {
                dx: 0,
                dy: 0 as number | (() => number),
                data: [0, 5, 10]
            }
        });

        const { container } = render(GridXTest, {
            props
        });
        const gridLines = container.querySelectorAll('g.grid-x > line');
        expect(gridLines[0].getAttribute('transform')).toBe('translate(1,0)');

        props.gridArgs.dx = 10;
        await tick();

        const gridLines2 = container.querySelectorAll('g.grid-x > line');
        expect(gridLines2[0].getAttribute('transform')).toBe('translate(11,0)');

        const dy = vi.fn(() => 20);

        props.gridArgs.dy = dy;
        await tick();

        const gridLines3 = container.querySelectorAll('g.grid-x > line');
        expect(gridLines3[0].getAttribute('transform')).toBe('translate(11,20)');
        expect(dy).toHaveBeenCalled();
    });

    it('passes index to accessor functions', () => {
        const y1 = vi.fn((d: any, i: number) => d + i);
        const stroke = vi.fn((_d: any, _i: number) => 'gray');
        render(GridXTest, {
            props: {
                plotArgs: {
                    y: { domain: [0, 10] }
                },
                gridArgs: {
                    data: [0, 5, 10],
                    y1,
                    stroke
                }
            }
        });
        expect(y1).toHaveBeenCalled();
        expect(y1.mock.calls[0]).toStrictEqual([0, 0]);
        expect(y1.mock.calls[1]).toStrictEqual([5, 1]);
        expect(y1.mock.calls[2]).toStrictEqual([10, 2]);
        expect(stroke).toHaveBeenCalled();
        expect(stroke.mock.calls[0]).toStrictEqual([0, 0]);
        expect(stroke.mock.calls[1]).toStrictEqual([5, 1]);
        expect(stroke.mock.calls[2]).toStrictEqual([10, 2]);
    });
});
