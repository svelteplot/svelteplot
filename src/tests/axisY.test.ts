import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import AxisYTest from './axisY.test.svelte';

describe('AxisY mark', () => {
    it('default axis', () => {
        const { container } = render(AxisYTest, {
            props: {
                plotArgs: { height: 300, y: { domain: [0, 100] } }
            }
        });

        const ticks = container.querySelectorAll('g.axis-y > g.tick') as NodeListOf<SVGGElement>;
        const tickValues = Array.from(ticks).map((t) => t.querySelector('text')?.textContent);
        expect(ticks.length).toBeGreaterThan(2);
        expect(tickValues).toStrictEqual(['0', '20', '40', '60', '80', '100']);
    });

    it('custom tick values via axis.data', () => {
        const { container } = render(AxisYTest, {
            props: {
                plotArgs: { height: 300, y: { domain: [0, 100] } },
                axisArgs: { data: [0, 20, 80] }
            }
        });

        const ticks = container.querySelectorAll('g.axis-y > g.tick') as NodeListOf<SVGGElement>;
        const tickValues = Array.from(ticks).map((t) => t.querySelector('text')?.textContent);
        expect(ticks.length).toBe(3);
        expect(tickValues).toStrictEqual(['0', '20', '80']);
    });

    it('custom tick values via axis.ticks', () => {
        const { container } = render(AxisYTest, {
            props: {
                plotArgs: { height: 300, y: { domain: [0, 100] } },
                axisArgs: { ticks: [0, 20, 80] }
            }
        });

        const ticks = container.querySelectorAll('g.axis-y > g.tick') as NodeListOf<SVGGElement>;
        const tickValues = Array.from(ticks).map((t) => t.querySelector('text')?.textContent);
        expect(ticks.length).toBe(3);
        expect(tickValues).toStrictEqual(['0', '20', '80']);
    });

    it('custom tick values via x scale ticks options', () => {
        const { container } = render(AxisYTest, {
            props: {
                plotArgs: { height: 300, y: { domain: [0, 100], ticks: [0, 20, 80] } }
            }
        });

        const ticks = container.querySelectorAll('g.axis-y > g.tick') as NodeListOf<SVGGElement>;
        const tickValues = Array.from(ticks).map((t) => t.querySelector('text')?.textContent);
        expect(ticks.length).toBe(3);
        expect(tickValues).toStrictEqual(['0', '20', '80']);
    });

    it('tick count via axis.tickCount', () => {
        const { container } = render(AxisYTest, {
            props: {
                plotArgs: { height: 300, y: { domain: [0, 100] } },
                axisArgs: { tickCount: 3 }
            }
        });

        const ticks = container.querySelectorAll('g.axis-y > g.tick') as NodeListOf<SVGGElement>;
        const tickValues = Array.from(ticks).map((t) => t.querySelector('text')?.textContent);
        expect(ticks.length).toBe(3);
        expect(tickValues).toStrictEqual(['0', '50', '100']);
    });

    it('tick count via axis.ticks', () => {
        const { container } = render(AxisYTest, {
            props: {
                plotArgs: { height: 300, y: { domain: [0, 100] } },
                axisArgs: { ticks: 3 }
            }
        });

        const ticks = container.querySelectorAll('g.axis-y > g.tick') as NodeListOf<SVGGElement>;
        const tickValues = Array.from(ticks).map((t) => t.querySelector('text')?.textContent);
        expect(ticks.length).toBe(3);
        expect(tickValues).toStrictEqual(['0', '50', '100']);
    });

    it('tickSpacing', () => {
        const { container } = render(AxisYTest, {
            props: {
                plotArgs: { height: 300, y: { domain: [0, 100] } },
                axisArgs: { tickSpacing: 200 }
            }
        });

        const ticks = container.querySelectorAll('g.axis-y > g.tick') as NodeListOf<SVGGElement>;
        const tickValues = Array.from(ticks).map((t) => t.querySelector('text')?.textContent);
        expect(ticks.length).toBe(3);
        expect(tickValues).toStrictEqual(['0', '50', '100']);
    });

    it('tickSpacing', () => {
        const { container } = render(AxisYTest, {
            props: {
                plotArgs: { height: 300, y: { domain: [0, 100], tickSpacing: 200 } }
            }
        });

        const ticks = container.querySelectorAll('g.axis-y > g.tick') as NodeListOf<SVGGElement>;
        const tickValues = Array.from(ticks).map((t) => t.querySelector('text')?.textContent);
        expect(ticks.length).toBe(3);
        expect(tickValues).toStrictEqual(['0', '50', '100']);
    });

    it('tick interval via scale options', () => {
        const { container } = render(AxisYTest, {
            props: {
                plotArgs: { height: 300, y: { domain: [0, 100], interval: 30 } }
            }
        });

        const ticks = container.querySelectorAll('g.axis-y > g.tick') as NodeListOf<SVGGElement>;
        const tickValues = Array.from(ticks).map((t) => t.querySelector('text')?.textContent);
        expect(tickValues).toStrictEqual(['0', '30', '60', '90', '120']);
    });

    it('tick interval via axis options', () => {
        const { container } = render(AxisYTest, {
            props: {
                plotArgs: { height: 300, y: { domain: [0, 100] } },
                axisArgs: { interval: 30 }
            }
        });

        const ticks = container.querySelectorAll('g.axis-y > g.tick') as NodeListOf<SVGGElement>;
        const tickValues = Array.from(ticks).map((t) => t.querySelector('text')?.textContent);
        expect(tickValues).toStrictEqual(['0', '30', '60', '90', '120']);
    });
});
