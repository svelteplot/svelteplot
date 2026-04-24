import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import RuleYTest from './ruleY.test.svelte';
import { getTranslate } from './utils';

const testData = [
    { x: 'A', y: 10 },
    { x: 'B', y: 15 },
    { x: 'A', y: 20 }
];

describe('RuleY mark', () => {
    it('renders horizontal rules with basic props', () => {
        const { container } = render(RuleYTest, {
            props: {
                plotArgs: {},
                ruleArgs: {
                    data: testData,
                    y: 'y'
                }
            }
        });

        const rules = Array.from(
            container.querySelectorAll('g.rule-y > line') as NodeListOf<SVGLineElement>
        );

        expect(rules.length).toBe(3);

        const translate = rules.map((rule) => getTranslate(rule));
        // Y-axis positions - values will vary based on scale
        expect(translate[0][0]).toBe(0);
        expect(translate[1][0]).toBe(0);
        expect(translate[2][0]).toBe(0);
        // Y positions should be different for each rule
        expect(translate[0][1]).not.toBe(translate[1][1]);
        expect(translate[1][1]).not.toBe(translate[2][1]);
    });

    it('renders rules spanning full width by default', () => {
        const { container } = render(RuleYTest, {
            props: {
                plotArgs: {
                    x: { domain: [0, 10] }
                },
                ruleArgs: {
                    data: testData,
                    y: 'y'
                }
            }
        });

        const rules = container.querySelectorAll('g.rule-y > line') as NodeListOf<SVGLineElement>;
        expect(rules.length).toBe(3);

        rules.forEach((rule) => {
            const x1 = parseFloat(rule.getAttribute('x1')!);
            const x2 = parseFloat(rule.getAttribute('x2')!);
            // Rules should span from margin to right edge
            expect(x1).toBeLessThan(x2);
            expect(x2 - x1).toBeGreaterThan(50); // Should span most of plot width
        });
    });

    it('applies dx and dy offsets', () => {
        const { container } = render(RuleYTest, {
            props: {
                plotArgs: {
                    x: { domain: [0, 10] },
                    y: { domain: [0, 30] }
                },
                ruleArgs: {
                    dx: 20,
                    dy: 10,
                    data: [{ y: 10 }],
                    y: 'y'
                }
            }
        });

        const rules = Array.from(
            container.querySelectorAll('g.rule-y > line') as NodeListOf<SVGLineElement>
        );

        expect(rules.length).toBe(1);
        // dx affects the x1/x2 positions of the horizontal line
        const x1 = parseFloat(rules[0].getAttribute('x1')!);
        const x2 = parseFloat(rules[0].getAttribute('x2')!);

        // Both x1 and x2 should have the dx offset applied
        // With dx=20 and marginLeft=5 (default), x1 should be at least 20+5=25
        expect(x1).toBeGreaterThanOrEqual(20);
        expect(x2).toBeGreaterThan(x1);
    });

    it('applies stroke styling', () => {
        const { container } = render(RuleYTest, {
            props: {
                plotArgs: {},
                ruleArgs: {
                    data: testData,
                    y: 'y',
                    stroke: 'blue',
                    strokeOpacity: 0.7
                }
            }
        });

        const rules = container.querySelectorAll('g.rule-y > line') as NodeListOf<SVGLineElement>;
        expect(rules.length).toBe(3);

        rules.forEach((rule) => {
            const style = rule.getAttribute('style') || '';
            expect(style).toContain('stroke: blue');
            expect(style).toContain('stroke-opacity: 0.7');
        });
    });

    it('applies inset properties', () => {
        const { container } = render(RuleYTest, {
            props: {
                plotArgs: {
                    x: { domain: [0, 10] }
                },
                ruleArgs: {
                    data: [{ y: 10 }],
                    y: 'y',
                    inset: 10
                }
            }
        });

        const rule = container.querySelector('g.rule-y > line') as SVGLineElement;
        const x1 = parseFloat(rule.getAttribute('x1')!);
        const x2 = parseFloat(rule.getAttribute('x2')!);

        // Both ends should be inset by 10
        expect(x1).toBeGreaterThanOrEqual(10);
        // x2 should be reduced by inset
        expect(x2).toBeLessThan(95); // Max width minus inset
    });

    it('applies insetLeft and insetRight independently', () => {
        const { container } = render(RuleYTest, {
            props: {
                plotArgs: {
                    x: { domain: [0, 10] }
                },
                ruleArgs: {
                    data: [{ y: 10 }],
                    y: 'y',
                    insetLeft: 5,
                    insetRight: 15
                }
            }
        });

        const rule = container.querySelector('g.rule-y > line') as SVGLineElement;
        const x1 = parseFloat(rule.getAttribute('x1')!);
        const x2 = parseFloat(rule.getAttribute('x2')!);

        // Left should be inset by 5
        expect(x1).toBeGreaterThanOrEqual(5);
        // Right should be inset by 15 (less than without inset)
        expect(x2).toBeLessThan(100 - 15);
    });

    it('uses x1 and x2 when provided', () => {
        const { container } = render(RuleYTest, {
            props: {
                plotArgs: {
                    x: { domain: [0, 100] }
                },
                ruleArgs: {
                    data: [{ y: 10, x1: 20, x2: 80 }],
                    y: 'y',
                    x1: 'x1',
                    x2: 'x2'
                }
            }
        });

        const rule = container.querySelector('g.rule-y > line') as SVGLineElement;
        const x1 = parseFloat(rule.getAttribute('x1')!);
        const x2 = parseFloat(rule.getAttribute('x2')!);

        // Should use specified x1/x2 values (scaled)
        expect(x1).toBeLessThan(x2);
        // Exact values depend on scale, but they should be different from defaults
        expect(x2 - x1).toBeGreaterThan(10);
        expect(x2 - x1).toBeLessThan(90);
    });

    it('handles empty data', () => {
        const { container } = render(RuleYTest, {
            props: {
                plotArgs: {},
                ruleArgs: {
                    data: [],
                    y: 'y'
                }
            }
        });

        const rules = container.querySelectorAll('g.rule-y > line') as NodeListOf<SVGLineElement>;
        expect(rules.length).toBe(0);
    });

    it('renders on canvas when canvas is true', () => {
        const { container } = render(RuleYTest, {
            props: {
                plotArgs: {},
                ruleArgs: {
                    data: testData,
                    y: 'y',
                    canvas: true
                }
            }
        });

        const canvas = container.querySelector('foreignObject canvas');
        const rules = container.querySelectorAll('g.rule-y > line') as NodeListOf<SVGLineElement>;

        expect(canvas).toBeTruthy();
        expect(rules.length).toBe(0);
    });

    it('passes index to accessor functions', () => {
        const x1 = vi.fn((d: any, i: number) => i * 10);
        const stroke = vi.fn((_d: any, _i: number) => 'gray');
        render(RuleYTest, {
            props: {
                plotArgs: {
                    x: { domain: [0, 100] }
                },
                ruleArgs: {
                    data: testData,
                    y: 'y',
                    x1,
                    stroke
                }
            }
        });
        expect(x1).toHaveBeenCalled();
        expect(x1.mock.calls[0][1]).toBe(0);
        expect(x1.mock.calls[1][1]).toBe(1);
        expect(x1.mock.calls[2][1]).toBe(2);
        expect(stroke).toHaveBeenCalled();
        expect(stroke.mock.calls[0][1]).toBe(0);
        expect(stroke.mock.calls[1][1]).toBe(1);
        expect(stroke.mock.calls[2][1]).toBe(2);
    });

    it('handles data with raw y values', () => {
        const { container } = render(RuleYTest, {
            props: {
                plotArgs: {
                    y: { domain: [0, 100] }
                },
                ruleArgs: {
                    data: [0, 50, 100]
                }
            }
        });

        const rules = Array.from(
            container.querySelectorAll('g.rule-y > line') as NodeListOf<SVGLineElement>
        );
        expect(rules.length).toBe(3);

        const translate = rules.map((rule) => getTranslate(rule)[1]);
        // Should be positioned at 0%, 50%, and 100% of the plot height (reversed for y-axis)
        expect(translate[0]).toBeGreaterThan(translate[1]);
        expect(translate[1]).toBeGreaterThan(translate[2]);
    });
});
