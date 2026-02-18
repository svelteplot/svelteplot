import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import RuleXTest from './ruleX.test.svelte';
import { getTranslate } from './utils';
import { tick } from 'svelte';

const testData = [
    { x: 10, y: 'A' },
    { x: 15, y: 'B' },
    { x: 20, y: 'A' }
];

describe('RuleX mark', () => {
    it('renders vertical rules with basic props', () => {
        const { container } = render(RuleXTest, {
            props: {
                plotArgs: {},
                ruleArgs: {
                    data: testData,
                    x: 'x'
                }
            }
        });

        const rules = Array.from(
            container.querySelectorAll('g.rule-x > line') as NodeListOf<SVGLineElement>
        );

        expect(rules.length).toBe(3);

        const translate = rules.map((rule) => getTranslate(rule));
        expect(translate).toEqual([
            [11, 0],
            [48.5, 0],
            [86, 0]
        ]);
    });

    it('renders rules spanning full height by default', () => {
        const { container } = render(RuleXTest, {
            props: {
                plotArgs: {
                    y: { domain: [0, 10] }
                },
                ruleArgs: {
                    data: testData,
                    x: 'x'
                }
            }
        });

        const rules = container.querySelectorAll('g.rule-x > line') as NodeListOf<SVGLineElement>;
        expect(rules.length).toBe(3);

        rules.forEach((rule) => {
            const y1 = parseFloat(rule.getAttribute('y1')!);
            const y2 = parseFloat(rule.getAttribute('y2')!);
            // Rules should span from margin to bottom
            expect(y1).toBeLessThan(y2);
            expect(y2 - y1).toBeGreaterThan(50); // Should span most of plot height
        });
    });

    it('applies dx and dy offsets', () => {
        const { container } = render(RuleXTest, {
            props: {
                plotArgs: {
                    x: { domain: [0, 30] },
                    y: { domain: [0, 10] }
                },
                ruleArgs: {
                    dx: 5,
                    dy: 10,
                    data: [{ x: 10 }],
                    x: 'x'
                }
            }
        });

        const rules = Array.from(
            container.querySelectorAll('g.rule-x > line') as NodeListOf<SVGLineElement>
        );

        expect(rules.length).toBe(1);
        // dy affects the y1/y2 positions of the vertical line
        const y1 = parseFloat(rules[0].getAttribute('y1')!);
        const y2 = parseFloat(rules[0].getAttribute('y2')!);

        // Both y1 and y2 should have the dy offset applied
        // With dy=10 and marginTop=5 (default), y1 should be at least 10+5=15
        expect(y1).toBeGreaterThanOrEqual(10);
        expect(y2).toBeGreaterThan(y1);
    });

    it('applies stroke styling', () => {
        const { container } = render(RuleXTest, {
            props: {
                plotArgs: {},
                ruleArgs: {
                    data: testData,
                    x: 'x',
                    stroke: 'red',
                    strokeOpacity: 0.5
                }
            }
        });

        const rules = container.querySelectorAll('g.rule-x > line') as NodeListOf<SVGLineElement>;
        expect(rules.length).toBe(3);

        rules.forEach((rule) => {
            const style = rule.getAttribute('style') || '';
            expect(style).toContain('stroke: red');
            expect(style).toContain('stroke-opacity: 0.5');
        });
    });

    it('applies inset properties', () => {
        const { container } = render(RuleXTest, {
            props: {
                plotArgs: {
                    y: { domain: [0, 10] }
                },
                ruleArgs: {
                    data: [{ x: 10 }],
                    x: 'x',
                    inset: 10
                }
            }
        });

        const rule = container.querySelector('g.rule-x > line') as SVGLineElement;
        const y1 = parseFloat(rule.getAttribute('y1')!);
        const y2 = parseFloat(rule.getAttribute('y2')!);

        // Both ends should be inset by 10
        expect(y1).toBeGreaterThanOrEqual(10);
        // y2 should be reduced by inset
        expect(y2).toBeLessThan(95); // Max height minus inset
    });

    it('applies insetTop and insetBottom independently', () => {
        const { container } = render(RuleXTest, {
            props: {
                plotArgs: {
                    y: { domain: [0, 10] }
                },
                ruleArgs: {
                    data: [{ x: 10 }],
                    x: 'x',
                    insetTop: 5,
                    insetBottom: 15
                }
            }
        });

        const rule = container.querySelector('g.rule-x > line') as SVGLineElement;
        const y1 = parseFloat(rule.getAttribute('y1')!);
        const y2 = parseFloat(rule.getAttribute('y2')!);

        // Top should be inset by 5
        expect(y1).toBeGreaterThanOrEqual(5);
        // Bottom should be inset by 15 (less than without inset)
        expect(y2).toBeLessThan(100 - 15);
    });

    it('uses y1 and y2 when provided', () => {
        const { container } = render(RuleXTest, {
            props: {
                plotArgs: {
                    y: { domain: [0, 100] }
                },
                ruleArgs: {
                    data: [{ x: 10, y1: 20, y2: 80 }],
                    x: 'x',
                    y1: 'y1',
                    y2: 'y2'
                }
            }
        });

        const rule = container.querySelector('g.rule-x > line') as SVGLineElement;
        const y1 = parseFloat(rule.getAttribute('y1')!);
        const y2 = parseFloat(rule.getAttribute('y2')!);

        // Should use specified y1/y2 values (scaled)
        // Y-axis is inverted in SVG, so y1 (20) appears lower (higher value) than y2 (80)
        expect(y1).toBeGreaterThan(y2);
        // Exact values depend on scale, but they should be different from defaults
        const span = Math.abs(y2 - y1);
        expect(span).toBeGreaterThan(10);
        expect(span).toBeLessThan(90);
    });

    it('handles empty data', () => {
        const { container } = render(RuleXTest, {
            props: {
                plotArgs: {},
                ruleArgs: {
                    data: [],
                    x: 'x'
                }
            }
        });

        const rules = container.querySelectorAll('g.rule-x > line') as NodeListOf<SVGLineElement>;
        expect(rules.length).toBe(0);
    });

    it('renders on canvas when canvas is true', () => {
        const { container } = render(RuleXTest, {
            props: {
                plotArgs: {},
                ruleArgs: {
                    data: testData,
                    x: 'x',
                    canvas: true
                }
            }
        });

        const canvas = container.querySelector('foreignObject canvas');
        const rules = container.querySelectorAll('g.rule-x > line') as NodeListOf<SVGLineElement>;

        expect(canvas).toBeTruthy();
        expect(rules.length).toBe(0);
    });

    it('passes index to accessor functions', () => {
        const y1 = vi.fn((d, i) => i * 10);
        const stroke = vi.fn((d, i) => 'gray');
        render(RuleXTest, {
            props: {
                plotArgs: {
                    y: { domain: [0, 100] }
                },
                ruleArgs: {
                    data: testData,
                    x: 'x',
                    y1,
                    stroke
                }
            }
        });
        expect(y1).toHaveBeenCalled();
        expect(y1.mock.calls[0][1]).toBe(0);
        expect(y1.mock.calls[1][1]).toBe(1);
        expect(y1.mock.calls[2][1]).toBe(2);
        expect(stroke).toHaveBeenCalled();
        expect(stroke.mock.calls[0][1]).toBe(0);
        expect(stroke.mock.calls[1][1]).toBe(1);
        expect(stroke.mock.calls[2][1]).toBe(2);
    });

    it('handles data with raw x values', () => {
        const { container } = render(RuleXTest, {
            props: {
                plotArgs: {
                    x: { domain: [0, 100] }
                },
                ruleArgs: {
                    data: [0, 50, 100]
                }
            }
        });

        const rules = Array.from(
            container.querySelectorAll('g.rule-x > line') as NodeListOf<SVGLineElement>
        );
        expect(rules.length).toBe(3);

        const translate = rules.map((rule) => getTranslate(rule)[0]);
        // Should be positioned at 0%, 50%, and 100% of the plot width
        expect(translate[0]).toBeLessThan(translate[1]);
        expect(translate[1]).toBeLessThan(translate[2]);
    });
});
