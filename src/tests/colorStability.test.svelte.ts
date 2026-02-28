import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import BarYTest from './barY.test.svelte';
import { tick } from 'svelte';
import { categoricalSchemes } from 'svelteplot/helpers/colors';

const observable10 = categoricalSchemes.get('observable10') as string[];

const fullData = [
    { x: '2021', y: 10, cat: 'A' },
    { x: '2021', y: 20, cat: 'B' },
    { x: '2021', y: 30, cat: 'C' }
];

function getBarFills(container: HTMLElement): string[] {
    const rects = container.querySelectorAll('g.bar-y rect') as NodeListOf<SVGRectElement>;
    return Array.from(rects).map((r) => r.style.fill);
}

describe('Color stability with explicit domain', () => {
    it('assigns colors by domain position, not data position', () => {
        // Pin domain to ['A','B','C'] but only provide A and B data
        const { container } = render(BarYTest, {
            props: {
                plotArgs: {
                    color: { domain: ['A', 'B', 'C'] }
                },
                barArgs: {
                    data: fullData.filter((d) => d.cat !== 'C'),
                    x: 'x',
                    y: 'y',
                    fill: 'cat'
                }
            }
        });
        const fills = getBarFills(container);
        expect(fills.length).toBe(2);
        // A should get color index 0, B should get color index 1 (same as with full data)
        expect(fills[0]).toBe(observable10[0]); // A → first color
        expect(fills[1]).toBe(observable10[1]); // B → second color (not shifted to first)
    });

    it('colors remain stable when data shrinks', async () => {
        const props = $state({
            plotArgs: {
                color: { domain: ['A', 'B', 'C'] }
            },
            barArgs: {
                data: fullData,
                x: 'x',
                y: 'y',
                fill: 'cat'
            }
        });
        const { container } = render(BarYTest, { props });
        const fillsBefore = getBarFills(container);
        expect(fillsBefore.length).toBe(3);
        expect(fillsBefore[0]).toBe(observable10[0]); // A
        expect(fillsBefore[1]).toBe(observable10[1]); // B
        expect(fillsBefore[2]).toBe(observable10[2]); // C

        // Remove category C from data (simulating unchecking a checkbox)
        props.barArgs.data = fullData.filter((d) => d.cat !== 'C');
        await tick();

        const fillsAfter = getBarFills(container);
        expect(fillsAfter.length).toBe(2);
        // A and B should keep their original colors
        expect(fillsAfter[0]).toBe(observable10[0]); // A still first color
        expect(fillsAfter[1]).toBe(observable10[1]); // B still second color
    });

    it('without explicit domain, colors shift when data changes', async () => {
        // This test documents the CURRENT behavior without a pinned domain
        const props = $state({
            plotArgs: {},
            barArgs: {
                data: fullData,
                x: 'x',
                y: 'y',
                fill: 'cat'
            }
        });
        const { container } = render(BarYTest, { props });
        const fillsBefore = getBarFills(container);
        expect(fillsBefore.length).toBe(3);

        // Remove category A
        props.barArgs.data = fullData.filter((d) => d.cat !== 'A');
        await tick();

        const fillsAfter = getBarFills(container);
        expect(fillsAfter.length).toBe(2);
        // Without explicit domain, B shifts to first color position
        expect(fillsAfter[0]).toBe(observable10[0]); // B takes first position
        expect(fillsAfter[1]).toBe(observable10[1]); // C takes second position
    });
});
