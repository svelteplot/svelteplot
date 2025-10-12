import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import RectYTest from './rectY.test.svelte';

const testData = [
    { date: '2020-01', value: 10 },
    { date: '2020-02', value: 20 },
    { date: '2020-03', value: 15 }
];

describe('RectY mark', () => {
    it('renders RectY with y prop', () => {
        const { container } = render(RectYTest, {
            props: {
                plotArgs: {},
                rectYArgs: {
                    data: testData,
                    x: 'date',
                    y: 'value'
                }
            }
        });

        const rects = container.querySelectorAll('g.rect > rect') as NodeListOf<SVGRectElement>;
        expect(rects.length).toBeGreaterThan(0);
    });

    it('renders RectY with function accessor for y', () => {
        const { container } = render(RectYTest, {
            props: {
                plotArgs: {},
                rectYArgs: {
                    data: testData,
                    x: 'date',
                    y: (d: any) => d.value * 2
                }
            }
        });

        const rects = container.querySelectorAll('g.rect > rect') as NodeListOf<SVGRectElement>;
        expect(rects.length).toBeGreaterThan(0);
    });

    it('renders RectY without y prop (using raw values)', () => {
        const { container } = render(RectYTest, {
            props: {
                plotArgs: {},
                rectYArgs: {
                    data: [10, 20, 15]
                }
            }
        });

        const rects = container.querySelectorAll('g.rect > rect') as NodeListOf<SVGRectElement>;
        expect(rects.length).toBeGreaterThan(0);
    });
});
