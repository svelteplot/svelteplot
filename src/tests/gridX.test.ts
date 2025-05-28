import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import GridXTest from './gridX.test.svelte';

describe('GridX mark', () => {
    it('simple x grid with stroke styles', () => {
        const { container } = render(GridXTest, {
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
            'g.grid-x > line'
        ) as NodeListOf<SVGLineElement>;
        expect(gridLines.length).toBe(3);
        expect(gridLines[0].style.strokeDasharray).toBe('5, 5');
        expect(gridLines[0].style.stroke).toBe('#008000');
        expect(gridLines[0].style.strokeOpacity).toBe('0.5');
    });
});
