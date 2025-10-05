import { getContext, hasContext, setContext } from 'svelte';
import type { PlotDefaults } from 'svelteplot/types';

const PLOT_DEFAULTS_KEY = Symbol('svelteplot/defaults');

export function setPlotDefaults(plotDefaults: Partial<PlotDefaults>) {
    const existingDefaults = getPlotDefaults();
    const mergedDefaults = { ...existingDefaults, ...plotDefaults };
    setContext(PLOT_DEFAULTS_KEY, mergedDefaults);
}

export function getPlotDefaults(): Partial<PlotDefaults> {
    return hasContext(PLOT_DEFAULTS_KEY)
        ? getContext<PlotDefaults>(PLOT_DEFAULTS_KEY)
        : // Fallback for backward compatibility
          hasContext('svelteplot/defaults')
          ? (console.error(
                `svelteplot: Please use new setPlotDefaults hook instead of 'svelteplot/defaults' context`
            ),
            getContext<PlotDefaults>('svelteplot/defaults'))
          : {};
}
