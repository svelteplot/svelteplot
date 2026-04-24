import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
// @ts-ignore - svelte-check errors on .svelte imports, tsc does not
import TrailTest from './trail.test.svelte';

describe('Trail mark', () => {
    it('renders a single round-capped trail with varying radii', () => {
        const { container } = render(TrailTest, {
            props: {
                data: [
                    { x: 0, y: 0, r: 1 },
                    { x: 1, y: 1, r: 2 },
                    { x: 2, y: 0, r: 1 }
                ],
                x: 'x',
                y: 'y',
                r: 'r',
                curve: 'linear',
                cap: 'round',
                resolution: 1
            }
        });

        const trails = container.querySelectorAll('g.trail > path');
        expect(trails).toHaveLength(1);
        const d = trails[0]?.getAttribute('d');
        expect(d).toBe(
            'M-5.266560210854735,111.72429807159867L49.63774556038163,0.36745790656312494A10,10,0,1,1,67.36225443961837,9.632542093436875L7.266560210854735,118.27570192840133A7.071067811865475,7.071067811865475,0,1,1,-5.2665602108547365,111.72429807159867ZM67.36225443961837,0.36745790656312494L122.26656021085473,111.72429807159867A7.071067811865475,7.071067811865475,0,1,1,109.73343978914527,118.27570192840133L49.63774556038163,9.632542093436875A10,10,0,1,1,67.36225443961837,0.36745790656312494Z'
        );
    });

    it('renders butt-capped trail polygons with fixed resolution', () => {
        const { container } = render(TrailTest, {
            props: {
                data: [
                    { x: 0, y: 0, r: 1 },
                    { x: 1, y: 0, r: 1 }
                ],
                x: 'x',
                y: 'y',
                r: 'r',
                cap: 'butt',
                resolution: 1
            }
        });

        const path = container.querySelector('g.trail > path');
        expect(path).not.toBeNull();
        const d = path?.getAttribute('d');
        expect(d).toBe('M1,70L116,70L116,50L1,50Z');
    });

    it('creates one path per z-group', () => {
        const { container } = render(TrailTest, {
            props: {
                data: [
                    { x: 0, y: 0, z: 'A' },
                    { x: 1, y: 1, z: 'A' },
                    { x: 0, y: 2, z: 'B' },
                    { x: 1, y: 2, z: 'B' }
                ],
                x: 'x',
                y: 'y',
                z: 'z',
                r: 1,
                resolution: 1,
                cap: 'butt'
            }
        });

        const trails = container.querySelectorAll('g.trail > path');
        expect(trails).toHaveLength(2);
    });

    it('respects defined gaps within a group', () => {
        const { container } = render(TrailTest, {
            props: {
                data: [
                    { x: 0, y: 0, keep: true },
                    { x: 1, y: 0, keep: false },
                    { x: 2, y: 0, keep: true }
                ],
                x: 'x',
                y: 'y',
                r: 1,
                defined: (d: any) => d.keep,
                resolution: 1,
                cap: 'butt'
            }
        });

        const trail = container.querySelector('g.trail > path');
        const d = trail?.getAttribute('d') ?? '';
        expect(d.includes('Z M') || d.includes('ZM')).toBe(true);
    });

    it('accepts event handlers', () => {
        const handleClick = vi.fn();
        const { container } = render(TrailTest, {
            props: {
                data: [
                    { x: 0, y: 0, id: 'A' },
                    { x: 1, y: 1, id: 'A' }
                ],
                x: 'x',
                y: 'y',
                r: 1,
                resolution: 1,
                cap: 'butt',
                onclick: handleClick
            }
        });

        const trail = container.querySelector('g.trail > path');
        expect(trail).not.toBeNull();

        trail?.dispatchEvent(new MouseEvent('click'));
        expect(handleClick).toHaveBeenCalled();

        // check argument
        const eventArgs = handleClick.mock.calls[0];
        expect(eventArgs[1].id).toBe('A');
    });
});
