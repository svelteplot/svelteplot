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

    it('supports boolean grid shorthand for top-level Plot grid default', () => {
        const { container } = render(PlotDefaultsTest, {
            props: { defaults: { grid: true } }
        });
        expect(getDefaults(container)).toEqual({
            grid: { implicit: true }
        });
    });

    it('keeps grid mark defaults when grid shorthand is set in child context', () => {
        const { container } = render(PlotDefaultsNestedTest, {
            props: {
                parentDefaults: { grid: { stroke: 'crimson' } },
                childDefaults: { grid: true }
            }
        });
        expect(getDefaults(container)).toEqual({
            grid: { stroke: 'crimson', implicit: true }
        });
    });

    it('supports boolean frame shorthand for top-level Plot frame default', () => {
        const { container } = render(PlotDefaultsTest, {
            props: { defaults: { frame: true } }
        });
        expect(getDefaults(container)).toEqual({
            frame: { implicit: true }
        });
    });

    it('keeps frame mark defaults when frame shorthand is set in child context', () => {
        const { container } = render(PlotDefaultsNestedTest, {
            props: {
                parentDefaults: { frame: { stroke: 'crimson' } },
                childDefaults: { frame: true }
            }
        });
        expect(getDefaults(container)).toEqual({
            frame: { stroke: 'crimson', implicit: true }
        });
    });
});
