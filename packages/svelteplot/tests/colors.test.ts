import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import ColorsTest from './colors.test.svelte';
import { categoricalSchemes } from 'svelteplot/helpers/colors';

const observable10 = categoricalSchemes.get('observable10') as string[];

describe('Colors', () => {
    it('default color scheme is observable10', () => {
        const { container } = render(ColorsTest, {
            props: {
                dotOptions: {
                    data: [
                        {
                            x: 1,
                            sex: 'male'
                        },
                        {
                            x: 2,
                            sex: 'female'
                        }
                    ],
                    x: 'x',
                    y: 0,
                    fill: 'sex'
                },
                colorOptions: {}
            }
        });
        const dots = container.querySelectorAll('g.dot > path') as NodeListOf<SVGPathElement>;
        expect(dots.length).toBe(2);
        const styles = Array.from(dots).map(getDotStyle);
        expect(styles[0].fill).toBe(observable10[1]);
        expect(styles[1].fill).toBe(observable10[0]);
    });

    it('set custom scheme as object', () => {
        const { container } = render(ColorsTest, {
            props: {
                dotOptions: {
                    data: [
                        {
                            x: 1,
                            sex: 'male'
                        },
                        {
                            x: 2,
                            sex: 'female'
                        },
                        {
                            x: 3,
                            sex: 'in-between'
                        }
                    ],
                    x: 'x',
                    y: 0,
                    fill: 'sex'
                },
                colorOptions: {
                    scheme: {
                        male: 'green',
                        female: 'violet'
                    }
                }
            }
        });
        const dots = container.querySelectorAll('g.dot > path') as NodeListOf<SVGPathElement>;
        expect(dots.length).toBe(3);
        const styles = Array.from(dots).map(getDotStyle);
        expect(styles[0].fill).toBe('green');
        expect(styles[1].fill).toBe('violet');
        expect(styles[2].fill).toBe('#cccccc99');
    });
});

function getDotStyle(path: SVGPathElement) {
    return {
        fill: path.style.fill,
        stroke: path.style.stroke
    };
}
