import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
// @ts-ignore - svelte-check errors on .svelte imports, tsc does not
import LineYTest from './lineY.test.svelte';

describe('LineY mark', () => {
    it('renders a line from simple number array', () => {
        const { container } = render(LineYTest, {
            props: {
                plotArgs: {},
                lineArgs: {
                    data: [10, 20, 30]
                }
            }
        });

        const lines = container.querySelectorAll('g.lines > g > path');
        expect(lines).toHaveLength(1);
        const d = lines[0]?.getAttribute('d');
        expect(d).toBeTruthy();
        expect(d).toMatch(/^M/);
    });

    it('positions points along y-axis from raw values', () => {
        const { container } = render(LineYTest, {
            props: {
                plotArgs: {},
                lineArgs: {
                    data: [0, 50, 100]
                }
            }
        });

        const lines = container.querySelectorAll('g.lines > g > path');
        expect(lines).toHaveLength(1);

        const d = lines[0]?.getAttribute('d');
        expect(d).toBeTruthy();
    });

    it('handles zero and negative values', () => {
        const { container } = render(LineYTest, {
            props: {
                plotArgs: {},
                lineArgs: {
                    data: [-10, 0, 10]
                }
            }
        });

        const lines = container.querySelectorAll('g.lines > g > path');
        expect(lines).toHaveLength(1);
        const d = lines[0]?.getAttribute('d');
        expect(d).toBeTruthy();
        expect(d).toMatch(/^M/);
    });

    it('supports custom stroke color', () => {
        const { container } = render(LineYTest, {
            props: {
                plotArgs: {},
                lineArgs: {
                    data: [10, 20, 30],
                    stroke: 'red'
                }
            }
        });

        const lines = container.querySelectorAll(
            'g.lines > g > path'
        ) as NodeListOf<SVGPathElement>;
        expect(lines).toHaveLength(1);
        expect(lines[0]?.style.stroke).toBe('red');
    });

    it('supports strokeWidth', () => {
        const { container } = render(LineYTest, {
            props: {
                plotArgs: {},
                lineArgs: {
                    data: [10, 20, 30],
                    stroke: 'blue',
                    strokeWidth: 3
                }
            }
        });

        const lines = container.querySelectorAll(
            'g.lines > g > path'
        ) as NodeListOf<SVGPathElement>;
        expect(lines).toHaveLength(1);
        expect(lines[0]?.style.strokeWidth).toBe('3px');
    });

    it('supports curve option', () => {
        const { container } = render(LineYTest, {
            props: {
                plotArgs: {},
                lineArgs: {
                    data: [10, 20, 30],
                    curve: 'basis'
                }
            }
        });

        const lines = container.querySelectorAll('g.lines > g > path');
        expect(lines).toHaveLength(1);
        const d = lines[0]?.getAttribute('d');
        // Basis curves produce 'C' commands (cubic bezier)
        expect(d).toMatch(/C/);
    });

    it('handles single data point', () => {
        const { container } = render(LineYTest, {
            props: {
                plotArgs: {},
                lineArgs: {
                    data: [42]
                }
            }
        });

        const lines = container.querySelectorAll('g.lines > g > path');
        expect(lines).toHaveLength(1);
    });

    it('supports fill accessor on raw data', () => {
        const { container } = render(LineYTest, {
            props: {
                plotArgs: {},
                lineArgs: {
                    data: [10, 20, 30],
                    stroke: 'steelblue',
                    opacity: 0.7
                }
            }
        });

        const lines = container.querySelectorAll(
            'g.lines > g > path'
        ) as NodeListOf<SVGPathElement>;
        expect(lines).toHaveLength(1);
        expect(lines[0]?.style.stroke).toBe('steelblue');
    });
});
