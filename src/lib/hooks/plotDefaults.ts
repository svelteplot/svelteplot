import { getContext, hasContext, setContext } from 'svelte';
import type { PlotDefaults } from 'svelteplot/types';

const PLOT_DEFAULTS_KEY = Symbol('svelteplot/defaults');

/** sets default options for all Plot components in this component tree, merging with any existing defaults from parent contexts */
export function setPlotDefaults(plotDefaults: Partial<PlotDefaults>) {
    const existingDefaults = getPlotDefaults();
    const mergedDefaults = { ...existingDefaults, ...plotDefaults };
    setContext(PLOT_DEFAULTS_KEY, mergedDefaults);
}

/** retrieves the current plot defaults from the Svelte context, or an empty object if none have been set */
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
