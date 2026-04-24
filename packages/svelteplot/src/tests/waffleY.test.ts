import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import WaffleYTest from './waffleY.test.svelte';
import WaffleYSymbolTest from './waffleY.symbol.test.svelte';

describe('WaffleY mark', () => {
    const data = [
        { label: 'A', low: 0, high: 10 },
        { label: 'B', low: 0, high: 5 }
    ];

    it('renders a pattern and a path for each datum', () => {
        const { container } = render(WaffleYTest, {
            props: {
                plotArgs: {},
                waffleArgs: {
                    data,
                    x: 'label',
                    y1: 'low',
                    y2: 'high'
                }
            }
        });

        const groups = container.querySelectorAll('g.waffle-y');
        expect(groups.length).toBe(data.length);
        const patterns = container.querySelectorAll('g.waffle-y pattern');
        expect(patterns.length).toBe(data.length);
        const wafflePaths = container.querySelectorAll('g.waffle-y path');
        expect(wafflePaths.length).toBe(data.length);
    });

    it('uses rounded rects inside pattern when borderRadius is set', () => {
        const { container } = render(WaffleYTest, {
            props: {
                plotArgs: {},
                waffleArgs: {
                    data,
                    x: 'label',
                    y1: 'low',
                    y2: 'high',
                    borderRadius: 2
                }
            }
        });

        const patternPaths = container.querySelectorAll('pattern > path');
        const patternRects = container.querySelectorAll('pattern > rect');
        expect(patternPaths.length).toBe(data.length);
        expect(patternRects.length).toBe(0);
    });

    it('renders custom symbol snippet content inside pattern when provided', () => {
        const { container } = render(WaffleYSymbolTest, {
            props: {
                plotArgs: {},
                waffleArgs: {
                    data,
                    x: 'label',
                    y1: 'low',
                    y2: 'high'
                }
            }
        });

        // Our wrapper provides a rect with class `unit-symbol` for each datum
        const customSymbols = container.querySelectorAll('pattern > circle.unit-symbol');
        expect(customSymbols.length).toBe(data.length);
    });
});
