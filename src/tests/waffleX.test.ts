import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import WaffleXTest from './waffleX.test.svelte';
import WaffleXSymbolTest from './waffleX.symbol.test.svelte';

describe('WaffleX mark', () => {
    const data = [
        { label: 'A', low: 0, high: 10 },
        { label: 'B', low: 0, high: 5 }
    ];

    it('renders a pattern and a path for each datum', () => {
        const { container } = render(WaffleXTest, {
            props: {
                plotArgs: {},
                waffleArgs: {
                    data,
                    y: 'label',
                    x1: 'low',
                    x2: 'high'
                }
            }
        });

        const groups = container.querySelectorAll('g.waffle-x');
        expect(groups.length).toBe(data.length);
        const patterns = container.querySelectorAll('g.waffle-x pattern');
        expect(patterns.length).toBe(data.length);
        const wafflePaths = container.querySelectorAll('g.waffle-x path');
        expect(wafflePaths.length).toBe(data.length);
    });

    it('uses path instead of rect inside pattern when borderRadius is set', () => {
        const { container } = render(WaffleXTest, {
            props: {
                plotArgs: {},
                waffleArgs: {
                    data,
                    y: 'label',
                    x1: 'low',
                    x2: 'high',
                    borderRadius: 2
                }
            }
        });

        // Inside each pattern, a path is used to draw a rounded rect; no rects
        const patternPaths = container.querySelectorAll('.waffle-x pattern > path');
        const patternRects = container.querySelectorAll('.waffle-x pattern > rect');
        expect(patternPaths.length).toBe(data.length);
        expect(patternRects.length).toBe(0);
    });

    it('renders custom symbol snippet content inside pattern when provided', () => {
        const { container } = render(WaffleXSymbolTest, {
            props: {
                plotArgs: {},
                waffleArgs: {
                    data,
                    y: 'label',
                    x1: 'low',
                    x2: 'high'
                }
            }
        });

        // Our wrapper provides a circle with class `unit-symbol` for each datum
        const customSymbols = container.querySelectorAll('.waffle-x pattern > circle.unit-symbol');
        expect(customSymbols.length).toBe(data.length);
    });

    it('passes datum parameter to symbol snippet', () => {
        const { container } = render(WaffleXSymbolTest, {
            props: {
                plotArgs: {},
                waffleArgs: {
                    data,
                    y: 'label',
                    x1: 'low',
                    x2: 'high'
                }
            }
        });

        // Verify that the datum parameter is accessible and contains the correct label
        const customSymbols = container.querySelectorAll('.waffle-x pattern > circle.unit-symbol');
        expect(customSymbols.length).toBe(data.length);

        // Check that each circle has the correct data-label attribute from datum
        expect(customSymbols[0].getAttribute('data-label')).toBe('A');
        expect(customSymbols[1].getAttribute('data-label')).toBe('B');
    });
});
