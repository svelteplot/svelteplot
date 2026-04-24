import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
// @ts-ignore - svelte-check errors on .svelte imports, tsc does not
import DotXTest from './dotX.test.svelte';
import { getTranslate } from './utils';
import { symbol, symbolCircle } from 'd3-shape';

describe('DotX mark', () => {
    it('renders dots from simple number array', () => {
        const { container } = render(DotXTest, {
            props: {
                plotArgs: {},
                dotArgs: {
                    data: [10, 20, 30, 40, 50]
                }
            }
        });

        const dots = container.querySelectorAll('g.dot > path') as NodeListOf<SVGPathElement>;
        expect(dots.length).toBe(5);

        // Check that default circle symbol is used
        const defaultCircle = symbol(symbolCircle).size(3 ** 2 * Math.PI)();
        const paths = Array.from(dots).map((d) => d.getAttribute('d'));
        expect(paths[0]).toBe(defaultCircle);
    });

    it('positions dots along x-axis with fixed y position', () => {
        const { container } = render(DotXTest, {
            props: {
                plotArgs: {},
                dotArgs: {
                    data: [10, 30, 50]
                }
            }
        });

        const dots = container.querySelectorAll('g.dot > path') as NodeListOf<SVGPathElement>;
        expect(dots.length).toBe(3);

        const positions = Array.from(dots).map(getTranslate);

        // All dots should have the same y position (horizontal line)
        const yPositions = positions.map(([_x, y]) => y);
        expect(yPositions[0]).toBe(yPositions[1]);
        expect(yPositions[1]).toBe(yPositions[2]);

        // X positions should be different and correspond to data values
        const xPositions = positions.map(([x, _y]) => x);
        expect(xPositions[0]).toBeLessThan(xPositions[1]);
        expect(xPositions[1]).toBeLessThan(xPositions[2]);
    });

    it('renders dots from object data', () => {
        const testData = [{ value: 5 }, { value: 10 }, { value: 15 }];

        const { container } = render(DotXTest, {
            props: {
                plotArgs: {},
                dotArgs: {
                    data: testData,
                    x: 'value'
                }
            }
        });

        const dots = container.querySelectorAll('g.dot > path') as NodeListOf<SVGPathElement>;
        expect(dots.length).toBe(3);

        const positions = Array.from(dots).map(getTranslate);

        // All dots should have the same y position
        const yPositions = positions.map(([_x, y]) => y);
        expect(yPositions[0]).toBe(yPositions[1]);
        expect(yPositions[1]).toBe(yPositions[2]);
    });

    it('supports custom styling props', () => {
        const { container } = render(DotXTest, {
            props: {
                plotArgs: {},
                dotArgs: {
                    data: [10, 20, 30],
                    r: 10,
                    fill: 'red',
                    stroke: 'blue'
                }
            }
        });

        const dots = container.querySelectorAll('g.dot > path') as NodeListOf<SVGPathElement>;
        expect(dots.length).toBe(3);

        // Check that custom radius is applied
        const largeCircle = symbol(symbolCircle).size(10 ** 2 * Math.PI)();
        const paths = Array.from(dots).map((d) => d.getAttribute('d'));
        expect(paths[0]).toBe(largeCircle);

        // Check that custom colors are applied
        expect(dots[0].style.fill).toBe('red');
        expect(dots[0].style.stroke).toBe('blue');
    });

    it('supports accessor functions', () => {
        const { container } = render(DotXTest, {
            props: {
                plotArgs: {},
                dotArgs: {
                    data: [5, 10, 15],
                    fill: (d: number) => (d > 10 ? 'red' : 'blue')
                }
            }
        });

        const dots = container.querySelectorAll('g.dot > path') as NodeListOf<SVGPathElement>;
        expect(dots.length).toBe(3);

        expect(dots[0].style.fill).toBe('blue'); // 5 <= 10
        expect(dots[1].style.fill).toBe('blue'); // 10 <= 10
        expect(dots[2].style.fill).toBe('red'); // 15 > 10
    });
});
