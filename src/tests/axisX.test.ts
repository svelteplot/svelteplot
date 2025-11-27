import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import AxisXTest from './axisX.test.svelte';
import { getTranslate } from './utils';

describe('AxisX mark', () => {
    it('default axis', () => {
        const { container } = render(AxisXTest, {
            props: {
                plotArgs: { width: 400, x: { domain: [0, 100] } }
            }
        });

        const ticks = container.querySelectorAll('g.axis-x > g.tick') as NodeListOf<SVGGElement>;
        const tickValues = Array.from(ticks).map((t) => t.querySelector('text')?.textContent);
        expect(ticks.length).toBeGreaterThan(2);
        expect(tickValues).toStrictEqual(['0', '20', '40', '60', '80', '100']);
    });

    it('custom tick values via axis.data', () => {
        const { container } = render(AxisXTest, {
            props: {
                plotArgs: { width: 400, x: { domain: [0, 100] } },
                axisArgs: { data: [0, 20, 80] }
            }
        });

        const ticks = container.querySelectorAll('g.axis-x > g.tick') as NodeListOf<SVGGElement>;
        const tickValues = Array.from(ticks).map((t) => t.querySelector('text')?.textContent);
        expect(ticks.length).toBe(3);
        expect(tickValues).toStrictEqual(['0', '20', '80']);
    });

    it('custom tick values via x scale ticks options', () => {
        const { container } = render(AxisXTest, {
            props: {
                plotArgs: { width: 400, x: { domain: [0, 100], ticks: [0, 20, 80] } }
            }
        });

        const ticks = container.querySelectorAll('g.axis-x > g.tick') as NodeListOf<SVGGElement>;
        const tickValues = Array.from(ticks).map((t) => t.querySelector('text')?.textContent);
        expect(ticks.length).toBe(3);
        expect(tickValues).toStrictEqual(['0', '20', '80']);
    });

    it('custom tick values via axis.ticks', () => {
        const { container } = render(AxisXTest, {
            props: {
                plotArgs: { width: 400, x: { domain: [0, 100] } },
                axisArgs: { ticks: [0, 20, 80] }
            }
        });

        const ticks = container.querySelectorAll('g.axis-x > g.tick') as NodeListOf<SVGGElement>;
        const tickValues = Array.from(ticks).map((t) => t.querySelector('text')?.textContent);
        expect(ticks.length).toBe(3);
        expect(tickValues).toStrictEqual(['0', '20', '80']);
    });

    it('tick count via axis tickCount option', () => {
        const { container } = render(AxisXTest, {
            props: {
                plotArgs: { width: 400, x: { domain: [0, 100] } },
                axisArgs: { tickCount: 3 }
            }
        });

        const ticks = container.querySelectorAll('g.axis-x > g.tick') as NodeListOf<SVGGElement>;
        const tickValues = Array.from(ticks).map((t) => t.querySelector('text')?.textContent);
        expect(ticks.length).toBe(3);
        expect(tickValues).toStrictEqual(['0', '50', '100']);
    });

    it('tick count via axis.ticks', () => {
        const { container } = render(AxisXTest, {
            props: {
                plotArgs: { width: 400, x: { domain: [0, 100] } },
                axisArgs: { ticks: 3 }
            }
        });

        const ticks = container.querySelectorAll('g.axis-x > g.tick') as NodeListOf<SVGGElement>;
        const tickValues = Array.from(ticks).map((t) => t.querySelector('text')?.textContent);
        expect(ticks.length).toBe(3);
        expect(tickValues).toStrictEqual(['0', '50', '100']);
    });

    it('tick spacing via axis options', () => {
        const { container } = render(AxisXTest, {
            props: {
                plotArgs: { width: 400, x: { domain: [0, 100] } },
                axisArgs: { tickSpacing: 200 }
            }
        });

        const ticks = container.querySelectorAll('g.axis-x > g.tick') as NodeListOf<SVGGElement>;
        const tickValues = Array.from(ticks).map((t) => t.querySelector('text')?.textContent);
        expect(ticks.length).toBe(3);
        expect(tickValues).toStrictEqual(['0', '50', '100']);
    });

    it('tick spacing via scale options', () => {
        const { container } = render(AxisXTest, {
            props: {
                plotArgs: { width: 400, x: { domain: [0, 100], tickSpacing: 200 } }
            }
        });

        const ticks = container.querySelectorAll('g.axis-x > g.tick') as NodeListOf<SVGGElement>;
        const tickValues = Array.from(ticks).map((t) => t.querySelector('text')?.textContent);
        expect(ticks.length).toBe(3);
        expect(tickValues).toStrictEqual(['0', '50', '100']);
    });

    it('tick interval via scale options', () => {
        const { container } = render(AxisXTest, {
            props: {
                plotArgs: { width: 400, x: { domain: [0, 100], interval: 30 } }
            }
        });

        const ticks = container.querySelectorAll('g.axis-x > g.tick') as NodeListOf<SVGGElement>;
        const tickValues = Array.from(ticks).map((t) => t.querySelector('text')?.textContent);
        expect(tickValues).toStrictEqual(['0', '30', '60', '90']);
    });

    it('tick interval via axis options', () => {
        const { container } = render(AxisXTest, {
            props: {
                plotArgs: { width: 400, x: { domain: [0, 100] } },
                axisArgs: { interval: 30 }
            }
        });

        const ticks = container.querySelectorAll('g.axis-x > g.tick') as NodeListOf<SVGGElement>;
        const tickValues = Array.from(ticks).map((t) => t.querySelector('text')?.textContent);
        expect(tickValues).toStrictEqual(['0', '30', '60', '90']);
    });

    it('tick interval via axis.ticks', () => {
        const { container } = render(AxisXTest, {
            props: {
                plotArgs: {
                    width: 400,
                    x: { domain: [new Date(2000, 0, 1), new Date(2002, 0, 1)] }
                },
                axisArgs: { ticks: '6 months' }
            }
        });

        const ticks = container.querySelectorAll('g.axis-x > g.tick') as NodeListOf<SVGGElement>;
        const tickValues = Array.from(ticks).map((t) => t.querySelector('text')?.textContent);
        expect(ticks.length).toBe(5);
        expect(tickValues).toStrictEqual(['Jan2000', 'Jul', 'Jan2001', 'Jul', 'Jan2002']);
    });

    it('disable tick texts', () => {
        const { container } = render(AxisXTest, {
            props: {
                plotArgs: {
                    width: 400,
                    x: { domain: [new Date(2000, 0, 1), new Date(2002, 0, 1)] }
                },
                axisArgs: { ticks: '1 month', text: null }
            }
        });

        const ticks = container.querySelectorAll('g.axis-x > g.tick') as NodeListOf<SVGGElement>;
        const tickLines = container.querySelectorAll(
            'g.axis-x > g.tick line'
        ) as NodeListOf<SVGLineElement>;
        const tickLabels = container.querySelectorAll(
            'g.axis-x > g.tick text'
        ) as NodeListOf<SVGTextElement>;
        expect(ticks.length).toBe(25);
        expect(tickLines.length).toBe(25);
        expect(tickLabels.length).toBe(0);
    });

    it('sorts ordinal ticks by default', () => {
        const { container } = render(AxisXTest, {
            props: {
                plotArgs: {
                    width: 400
                },
                axisArgs: { data: ['C', 'A', 'A', 'B', 'B', 'C', 'B', 'C'] }
            }
        });
        const ticks = Array.from(
            container.querySelectorAll('g.axis-x > g.tick') as NodeListOf<SVGGElement>
        );
        expect(ticks.length).toBe(3);
        ticks.sort((a, b) => getTranslate(a)[0] - getTranslate(b)[0]);
        const tickValues = ticks.map((t) => t.querySelector('text')?.textContent);
        expect(tickValues).toStrictEqual(['A', 'B', 'C']);
    });

    it('does not ordinal ticks if turned off', () => {
        const { container } = render(AxisXTest, {
            props: {
                plotArgs: {
                    width: 400,
                    x: { sort: false }
                },
                axisArgs: { data: ['C', 'A', 'A', 'B', 'B', 'C', 'B', 'C'] }
            }
        });
        const ticks = Array.from(
            container.querySelectorAll('g.axis-x > g.tick') as NodeListOf<SVGGElement>
        );
        expect(ticks.length).toBe(3);
        ticks.sort((a, b) => getTranslate(a)[0] - getTranslate(b)[0]);
        const tickValues = ticks.map((t) => t.querySelector('text')?.textContent);
        expect(tickValues).toStrictEqual(['C', 'A', 'B']);
    });

    it('passes index to accessor functions', () => {
        const checkIndex = vi.fn((d) => d);
        const { container } = render(AxisXTest, {
            props: {
                plotArgs: { width: 500, x: { domain: [0, 100] } },
                axisArgs: {
                    tickFontSize: (d, i) => checkIndex(i) + 5
                }
            }
        });
        const ticks = Array.from(
            container.querySelectorAll('g.axis-x > g.tick') as NodeListOf<SVGGElement>
        );
        expect(ticks.length).toBe(6);
        expect(checkIndex.mock.calls[0]).toStrictEqual([0]);
        expect(checkIndex.mock.calls[1]).toStrictEqual([1]);
        const fontSizes = ticks.map((t) => t.querySelector('text')?.style.fontSize);
        expect(fontSizes).toStrictEqual(['5px', '6px', '7px', '8px', '9px', '10px']);
    });

    it('passes index to tickFormat functions', () => {
        const checkIndex = vi.fn((d) => String(d));
        const { container } = render(AxisXTest, {
            props: {
                plotArgs: { width: 500, x: { domain: [0, 100] } },
                axisArgs: {
                    tickFormat: (d, i) => checkIndex(i)
                }
            }
        });
        const ticks = Array.from(
            container.querySelectorAll('g.axis-x > g.tick') as NodeListOf<SVGGElement>
        );
        expect(ticks.length).toBe(6);
        expect(checkIndex.mock.calls[0]).toStrictEqual([0]);
        expect(checkIndex.mock.calls[1]).toStrictEqual([1]);
        const fontSizes = ticks.map((t) => t.querySelector('text')?.textContent);
        expect(fontSizes).toStrictEqual(['0', '1', '2', '3', '4', '5']);
    });

    it('passes ticks array to tickFormat functions', () => {
        const checkTicks = vi.fn((d, i, ticks) => String(d));
        const { container } = render(AxisXTest, {
            props: {
                plotArgs: { width: 500, x: { domain: [0, 100] } },
                axisArgs: {
                    interval: 20,
                    tickFormat: (d, i, ticks) => checkTicks(d, i, ticks)
                }
            }
        });
        const ticks = Array.from(
            container.querySelectorAll('g.axis-x > g.tick') as NodeListOf<SVGGElement>
        );
        expect(ticks.length).toBe(6);
        expect(checkTicks.mock.calls[0]).toStrictEqual([0, 0, [0, 20, 40, 60, 80, 100]]);
        expect(checkTicks.mock.calls[1]).toStrictEqual([20, 1, [0, 20, 40, 60, 80, 100]]);
    });

    it('keeps plain notation within a single magnitude domain', () => {
        const { container } = render(AxisXTest, {
            props: {
                plotArgs: { width: 400, x: { domain: [100, 900] } },
                axisArgs: { data: [100, 500, 900] }
            }
        });

        const ticks = Array.from(
            container.querySelectorAll('g.axis-x > g.tick') as NodeListOf<SVGGElement>
        );
        const tickValues = ticks.map((t) => t.querySelector('text')?.textContent);
        expect(tickValues).toStrictEqual(['100', '500', '900']);
    });

    it('switches to compact notation when domain spans magnitudes', () => {
        const { container } = render(AxisXTest, {
            props: {
                plotArgs: { width: 400, x: { type: 'log', domain: [0.001, 1000] } },
                axisArgs: { data: [0.001, 1, 1000] }
            }
        });

        const ticks = Array.from(
            container.querySelectorAll('g.axis-x > g.tick') as NodeListOf<SVGGElement>
        );
        const tickValues = ticks.map((t) => t.querySelector('text')?.textContent);
        expect(tickValues).toStrictEqual(['0.001', '1', '1K']);
    });

    it('switches to compact notation when domain crosses zero across magnitudes', () => {
        const { container } = render(AxisXTest, {
            props: {
                plotArgs: { width: 400, x: { domain: [-10000, 10000] } },
                axisArgs: { data: [-10000, 0, 10000] }
            }
        });

        const ticks = Array.from(
            container.querySelectorAll('g.axis-x > g.tick') as NodeListOf<SVGGElement>
        );
        const tickValues = ticks.map((t) => t.querySelector('text')?.textContent);
        expect(tickValues).toStrictEqual(['-10K', '0', '10K']);
    });

    it('removes duplicate ticks', () => {
        const { container } = render(AxisXTest, {
            props: {
                plotArgs: {
                    width: 400,
                    x: {
                        domain: [0, 4],
                        ticks: [1, 2, 3, 4],
                        tickFormat(d, i) {
                            return [i < 2 ? 'Foo' : 'Bar', d];
                        }
                    }
                }
            }
        });

        const ticks = container.querySelectorAll('g.axis-x > g.tick') as NodeListOf<SVGGElement>;
        expect(ticks.length).toBe(4);
        const tspans = Array.from(ticks).map((t) =>
            Array.from(t.querySelectorAll('text tspan')).map((ts) => ts?.textContent)
        );
        expect(tspans).toStrictEqual([
            ['Foo', '1'],
            ['', '2'],
            ['Bar', '3'],
            ['', '4']
        ]);
    });

    it('does not remove duplicate ticks if disabled', () => {
        const { container } = render(AxisXTest, {
            props: {
                plotArgs: {
                    width: 400,
                    x: {
                        domain: [0, 4],
                        ticks: [1, 2, 3, 4],
                        removeDuplicateTicks: false,
                        tickFormat(d, i) {
                            return [i < 2 ? 'Foo' : 'Bar', d];
                        }
                    }
                }
            }
        });

        const ticks = container.querySelectorAll('g.axis-x > g.tick') as NodeListOf<SVGGElement>;
        expect(ticks.length).toBe(4);
        const tspans = Array.from(ticks).map((t) =>
            Array.from(t.querySelectorAll('text tspan')).map((ts) => ts?.textContent)
        );
        expect(tspans).toStrictEqual([
            ['Foo', '1'],
            ['Foo', '2'],
            ['Bar', '3'],
            ['Bar', '4']
        ]);
    });
});
