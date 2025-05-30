import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import DotTest from './dot.test.svelte';
import { getTranslate } from './utils';
import { symbol, symbolCircle } from 'd3-shape';

const testData = [
    { x: 10, y: 20, value: 5 },
    { x: 15, y: 25, value: 10 }
];

describe('Dot mark', () => {
    it('renders dots with basic props', () => {
        const { container } = render(DotTest, {
            props: {
                plotArgs: {},
                dotArgs: {
                    data: testData,
                    x: 'x',
                    y: 'y',
                    r: 5,
                    fill: 'red'
                }
            }
        });

        const dots = container.querySelectorAll('g.dot > path') as NodeListOf<SVGPathElement>;
        expect(dots.length).toBe(2);
        const circle5 = symbol(symbolCircle).size(5 ** 2 * Math.PI)();
        const paths = Array.from(dots).map((d) => d.getAttribute('d'));
        expect(paths[0]).toBe(circle5);
        expect(paths[1]).toBe(circle5);
        expect(dots[0].style.fill).toBe('red');
        expect(dots[1].style.fill).toBe('red');
        const positions = Array.from(dots).map(getTranslate);
        expect(positions[0]).not.toStrictEqual(positions[1]);
    });

    it('scales dot size based on data', () => {
        const { container } = render(DotTest, {
            props: {
                plotArgs: {},
                dotArgs: {
                    data: testData,
                    x: 'x',
                    y: 'y',
                    r: 'value',
                    fill: 'blue'
                }
            }
        });

        const dots = container.querySelectorAll('g.dot > path') as NodeListOf<SVGPathElement>;
        expect(dots.length).toBe(2);
        const circle7 = symbol(symbolCircle).size(7.071 ** 2 * Math.PI)();
        const circle10 = symbol(symbolCircle).size(10 ** 2 * Math.PI)();
        const paths = Array.from(dots).map((d) => d.getAttribute('d'));
        expect(paths[0]).toBe(circle10);
        expect(paths[1]).toBe(circle7);
        expect(dots[0].style.fill).toBe('blue');
        expect(dots[1].style.fill).toBe('blue');
        const positions = Array.from(dots).map(getTranslate);
        expect(positions[0]).not.toStrictEqual(positions[1]);
    });

    it('maps colors based on data', () => {
        const { container } = render(DotTest, {
            props: {
                plotArgs: {},
                dotArgs: {
                    data: testData,
                    x: 'x',
                    y: 'y',
                    r: 5,
                    fill: (d: any) => (d.value > 5 ? 'red' : 'blue')
                }
            }
        });

        const dots = container.querySelectorAll('g.dot > path') as NodeListOf<SVGPathElement>;
        expect(dots.length).toBe(2);
        expect(dots[0].style.fill).toBe('blue');
        expect(dots[1].style.fill).toBe('red');
    });
});
