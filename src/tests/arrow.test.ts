import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import ArrowTest from './arrow.test.svelte';
import ResizeObserver from 'resize-observer-polyfill';

global.ResizeObserver = ResizeObserver;

describe('Arrow mark', () => {
    it('single arrow with basic properties', () => {
        const { container } = render(ArrowTest, {
            props: {
                data: [{ x1: 0, y1: 0, x2: 2, y2: 2 }],
                x1: 'x1',
                y1: 'y1',
                x2: 'x2',
                y2: 'y2'
            }
        });

        const arrows = container.querySelectorAll('g.arrow > g > path');
        expect(arrows.length).toBeGreaterThan(0);

        // The path for a straight arrow from (0,0) to (2,2)
        const mainPath = arrows[0];
        expect(mainPath).not.toBeNull();

        // We expect this to be an arrow path (not checking exact path since it might vary)
        const d = mainPath?.getAttribute('d');
        expect(d).toContain('M'); // Path should start with M
        expect(d).toContain('L'); // Path should contain line commands
    });

    it('arrow with bend property', () => {
        const { container } = render(ArrowTest, {
            props: {
                data: [{ x1: 0, y1: 0, x2: 2, y2: 2 }],
                x1: 'x1',
                y1: 'y1',
                x2: 'x2',
                y2: 'y2',
                bend: 30 // Add a 30-degree bend
            }
        });

        const arrows = container.querySelectorAll('g.arrow > g > path');
        expect(arrows.length).toBeGreaterThan(0);

        // The bent arrow path should contain A for arc
        const mainPath = arrows[0];
        const d = mainPath?.getAttribute('d');
        expect(d).toContain('A'); // Path should contain arc command for bent arrows
    });

    it('arrow with custom styling', () => {
        const { container } = render(ArrowTest, {
            props: {
                data: [{ x1: 0, y1: 0, x2: 2, y2: 2 }],
                x1: 'x1',
                y1: 'y1',
                x2: 'x2',
                y2: 'y2',
                stroke: 'red',
                strokeWidth: 3
            }
        });

        const arrows = container.querySelectorAll('g.arrow > g > path');
        expect(arrows.length).toBeGreaterThan(0);

        const mainPath = arrows[0];
        expect(mainPath?.style.stroke).toBe('red');
        expect(mainPath?.style.strokeWidth).toBe('3px');
    });

    it('arrow with custom head properties', () => {
        const { container } = render(ArrowTest, {
            props: {
                data: [{ x1: 0, y1: 0, x2: 2, y2: 2 }],
                x1: 'x1',
                y1: 'y1',
                x2: 'x2',
                y2: 'y2',
                headAngle: 90,
                headLength: 15
            }
        });

        const arrows = container.querySelectorAll('g.arrow > g > path');
        expect(arrows.length).toBeGreaterThan(0);

        // We're not checking exact path here since it's complex with head angle calculations
        // Just ensuring it renders something
        const mainPath = arrows[0];
        expect(mainPath).not.toBeNull();
    });

    it('arrows with inset properties', () => {
        const { container } = render(ArrowTest, {
            props: {
                data: [{ x1: 0, y1: 0, x2: 2, y2: 2 }],
                x1: 'x1',
                y1: 'y1',
                x2: 'x2',
                y2: 'y2',
                insetStart: 5,
                insetEnd: 10
            }
        });

        const arrows = container.querySelectorAll('g.arrow > g > path');
        expect(arrows.length).toBeGreaterThan(0);

        // We're not checking exact path here as insets adjust the exact points
        // Just ensuring it renders something
        const mainPath = arrows[0];
        expect(mainPath).not.toBeNull();
    });

    it('multiple arrows with stroke based on data property', () => {
        const { container } = render(ArrowTest, {
            props: {
                data: [
                    { x1: 0, y1: 0, x2: 1, y2: 1, category: 'A' },
                    { x1: 2, y1: 0, x2: 1, y2: 2, category: 'B' }
                ],
                x1: 'x1',
                y1: 'y1',
                x2: 'x2',
                y2: 'y2',
                stroke: 'category'
            }
        });

        const arrows = container.querySelectorAll('g.arrow > g > path');
        expect(arrows.length).toBe(2);
    });

    it('arrow with sweep property', () => {
        const { container } = render(ArrowTest, {
            props: {
                data: [{ x1: 0, y1: 0, x2: 2, y2: 2 }],
                x1: 'x1',
                y1: 'y1',
                x2: 'x2',
                y2: 'y2',
                bend: 30,
                sweep: -1 // Reverse the bend direction
            }
        });

        const arrows = container.querySelectorAll('g.arrow > g > path');
        expect(arrows.length).toBeGreaterThan(0);

        // The bent arrow path should contain A for arc
        const mainPath = arrows[0];
        expect(mainPath).not.toBeNull();
    });
});
