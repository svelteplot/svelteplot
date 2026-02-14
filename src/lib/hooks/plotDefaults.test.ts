import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import PlotDefaultsTest from './plotDefaults.test.svelte';
import PlotDefaultsNestedTest from './plotDefaultsNested.test.svelte';

function getDefaults(container: HTMLElement) {
    const el = container.querySelector('[data-testid="defaults"]')!;
    return JSON.parse(el.getAttribute('data-defaults')!);
}

describe('plotDefaults', () => {
    it('getPlotDefaults returns empty object when no defaults set', () => {
        const { container } = render(PlotDefaultsTest, {
            props: { defaults: {} }
        });
        expect(getDefaults(container)).toEqual({});
    });

    it('setPlotDefaults makes values available via getPlotDefaults', () => {
        const { container } = render(PlotDefaultsTest, {
            props: { defaults: { height: 200 } }
        });
        expect(getDefaults(container)).toEqual({
            height: 200
        });
    });

    it('setPlotDefaults merges with existing defaults', () => {
        const { container } = render(PlotDefaultsNestedTest, {
            props: {
                parentDefaults: { height: 200 },
                childDefaults: { inset: 5 }
            }
        });
        expect(getDefaults(container)).toEqual({
            height: 200,
            inset: 5
        });
    });

    it('later defaults override earlier ones for same key', () => {
        const { container } = render(PlotDefaultsNestedTest, {
            props: {
                parentDefaults: { height: 200 },
                childDefaults: { height: 300 }
            }
        });
        expect(getDefaults(container)).toEqual({
            height: 300
        });
    });
});
