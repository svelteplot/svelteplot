import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import PointerTest from './pointer.test.svelte';

const defaultPlotArgs = {
    x: { domain: [0, 100] },
    y: { domain: [0, 100] }
};

/**
 * Helper to dispatch a pointermove event on the plot body element.
 * In jsdom with margin=0, clientX/clientY map directly to pixel coordinates.
 */
function pointerMove(plotBody: HTMLElement, clientX: number, clientY: number) {
    plotBody.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY, bubbles: true }));
}

function pointerLeave(plotBody: HTMLElement) {
    plotBody.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
}

describe('Pointer mark', () => {
    it('renders g.pointer element', async () => {
        const { container } = render(PointerTest, {
            props: {
                plotArgs: defaultPlotArgs,
                pointerArgs: {
                    data: [{ x: 50, y: 50 }],
                    x: 'x',
                    y: 'y'
                }
            }
        });

        await tick();
        const g = container.querySelector('g.pointer');
        expect(g).not.toBeNull();
    });

    it('calls onupdate with nearest point on pointermove', async () => {
        const onupdate = vi.fn();

        const { container } = render(PointerTest, {
            props: {
                plotArgs: defaultPlotArgs,
                pointerArgs: {
                    data: [
                        { x: 25, y: 75 },
                        { x: 75, y: 25 }
                    ],
                    x: 'x',
                    y: 'y',
                    onupdate
                }
            }
        });

        await tick();
        const plotBody = container.querySelector('.plot-body') as HTMLElement;

        // Point {x:25, y:75} maps to pixel (25, 25) due to y-axis inversion
        // Point {x:75, y:25} maps to pixel (75, 75)
        // Cursor at (26, 25) is closest to first point
        pointerMove(plotBody, 26, 25);
        await tick();

        expect(onupdate).toHaveBeenCalled();
        const lastCall = onupdate.mock.lastCall![0];
        expect(lastCall).toHaveLength(1);
        expect(lastCall[0]).toMatchObject({ x: 25, y: 75 });
    });

    it('calls onupdate with empty array on pointerleave', async () => {
        const onupdate = vi.fn();

        const { container } = render(PointerTest, {
            props: {
                plotArgs: defaultPlotArgs,
                pointerArgs: {
                    data: [{ x: 50, y: 50 }],
                    x: 'x',
                    y: 'y',
                    onupdate
                }
            }
        });

        await tick();
        const plotBody = container.querySelector('.plot-body') as HTMLElement;

        // First move to select a point
        pointerMove(plotBody, 50, 50);
        await tick();

        // Then leave
        pointerLeave(plotBody);
        await tick();

        expect(onupdate).toHaveBeenLastCalledWith([]);
    });

    it('does not select point beyond maxDistance', async () => {
        const onupdate = vi.fn();

        const { container } = render(PointerTest, {
            props: {
                plotArgs: defaultPlotArgs,
                pointerArgs: {
                    data: [{ x: 50, y: 50 }],
                    x: 'x',
                    y: 'y',
                    maxDistance: 10,
                    onupdate
                }
            }
        });

        await tick();
        const plotBody = container.querySelector('.plot-body') as HTMLElement;

        // Point at pixel (50, 50), cursor at (80, 50) → 30px away, beyond maxDistance=10
        pointerMove(plotBody, 80, 50);
        await tick();

        expect(onupdate).toHaveBeenLastCalledWith([]);
    });

    it('selects point within custom maxDistance', async () => {
        const onupdate = vi.fn();

        const { container } = render(PointerTest, {
            props: {
                plotArgs: defaultPlotArgs,
                pointerArgs: {
                    data: [{ x: 50, y: 50 }],
                    x: 'x',
                    y: 'y',
                    maxDistance: 40,
                    onupdate
                }
            }
        });

        await tick();
        const plotBody = container.querySelector('.plot-body') as HTMLElement;

        // Point at pixel (50, 50), cursor at (80, 50) → 30px away, within maxDistance=40
        pointerMove(plotBody, 80, 50);
        await tick();

        expect(onupdate).toHaveBeenCalled();
        const lastCall = onupdate.mock.lastCall![0];
        expect(lastCall).toHaveLength(1);
        expect(lastCall[0]).toMatchObject({ x: 50, y: 50 });
    });

    it('selects nearest along x-axis when only x provided', async () => {
        const onupdate = vi.fn();

        const { container } = render(PointerTest, {
            props: {
                plotArgs: defaultPlotArgs,
                pointerArgs: {
                    data: [
                        { x: 20, y: 10 },
                        { x: 50, y: 90 },
                        { x: 80, y: 10 }
                    ],
                    x: 'x',
                    onupdate
                }
            }
        });

        await tick();
        const plotBody = container.querySelector('.plot-body') as HTMLElement;

        // With only x channel, selection is by x proximity only
        // Cursor at x=51, closest x value is 50
        pointerMove(plotBody, 51, 0);
        await tick();

        expect(onupdate).toHaveBeenCalled();
        const lastCall = onupdate.mock.lastCall![0];
        expect(lastCall).toHaveLength(1);
        expect(lastCall[0]).toMatchObject({ x: 50 });
    });

    it('selects multiple points within tolerance', async () => {
        const onupdate = vi.fn();

        // Data points with known pixel positions (pixel_y = 100 - data_y):
        // A: {x:50, y:50} → pixel (50, 50)
        // B: {x:50, y:52} → pixel (50, 48) — 2px from A in y
        // C: {x:50, y:55} → pixel (50, 45) — 5px from A in y
        // D: {x:60, y:50} → pixel (60, 50) — 10px from A in x
        const { container } = render(PointerTest, {
            props: {
                plotArgs: defaultPlotArgs,
                pointerArgs: {
                    data: [
                        { x: 50, y: 50, id: 'A' },
                        { x: 50, y: 52, id: 'B' },
                        { x: 50, y: 55, id: 'C' },
                        { x: 60, y: 50, id: 'D' }
                    ],
                    x: 'x',
                    y: 'y',
                    tolerance: 3,
                    onupdate
                }
            }
        });

        await tick();
        const plotBody = container.querySelector('.plot-body') as HTMLElement;

        // Cursor at pixel (50, 50) → nearest is A (distance 0)
        // B is 2px away in y (< tolerance 3) → included
        // C is 5px away in y (> tolerance 3) → excluded
        // D is 10px away in x (> tolerance 3) → excluded
        pointerMove(plotBody, 50, 50);
        await tick();

        expect(onupdate).toHaveBeenCalled();
        const lastCall = onupdate.mock.lastCall![0];
        expect(lastCall).toHaveLength(2);

        const ids = lastCall.map((d: any) => d.id).sort();
        expect(ids).toEqual(['A', 'B']);
    });

    it('onupdate receives original data properties', async () => {
        const onupdate = vi.fn();

        const { container } = render(PointerTest, {
            props: {
                plotArgs: defaultPlotArgs,
                pointerArgs: {
                    data: [{ x: 50, y: 50, label: 'Point A', meta: { id: 1 } }],
                    x: 'x',
                    y: 'y',
                    onupdate
                }
            }
        });

        await tick();
        const plotBody = container.querySelector('.plot-body') as HTMLElement;

        // Point at pixel (50, 50), cursor right on it
        pointerMove(plotBody, 50, 50);
        await tick();

        expect(onupdate).toHaveBeenCalled();
        const lastCall = onupdate.mock.lastCall![0];
        expect(lastCall).toHaveLength(1);
        expect(lastCall[0]).toMatchObject({
            x: 50,
            y: 50,
            label: 'Point A',
            meta: { id: 1 }
        });
    });

    it('handles empty data without crashing', async () => {
        const onupdate = vi.fn();

        const { container } = render(PointerTest, {
            props: {
                plotArgs: defaultPlotArgs,
                pointerArgs: {
                    data: [],
                    x: 'x',
                    y: 'y',
                    onupdate
                }
            }
        });

        await tick();
        const plotBody = container.querySelector('.plot-body') as HTMLElement;

        // Should not throw
        pointerMove(plotBody, 50, 50);
        await tick();

        expect(onupdate).toHaveBeenCalledWith([]);
    });
});
