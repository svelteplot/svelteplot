import { getContext, hasContext, setContext } from 'svelte';
import type { PlotDefaults } from 'svelteplot/types';

const PLOT_DEFAULTS_KEY = Symbol('svelteplot/defaults');

/** sets default options for all Plot components in this component tree, merging with any existing defaults from parent contexts */
export function setPlotDefaults(plotDefaults: Partial<PlotDefaults>) {
    const existingDefaults = getPlotDefaults();
    const normalizedDefaults = normalizePlotDefaults(plotDefaults, existingDefaults);
    const mergedDefaults = { ...existingDefaults, ...normalizedDefaults };
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

function normalizePlotDefaults(
    plotDefaults: Partial<PlotDefaults>,
    existingDefaults: Partial<PlotDefaults>
): Partial<PlotDefaults> {
    const grid = normalizeGridDefaults(plotDefaults.grid, existingDefaults.grid);
    const gridX = normalizeGridDefaults(plotDefaults.gridX, existingDefaults.gridX);
    const gridY = normalizeGridDefaults(plotDefaults.gridY, existingDefaults.gridY);
    const frame = normalizeFrameDefaults(plotDefaults.frame, existingDefaults.frame);

    return {
        ...plotDefaults,
        ...(grid !== undefined ? { grid } : {}),
        ...(gridX !== undefined ? { gridX } : {}),
        ...(gridY !== undefined ? { gridY } : {}),
        ...(frame !== undefined ? { frame } : {})
    };
}

function normalizeGridDefaults(
    input: Partial<PlotDefaults['grid']> | true | undefined,
    existing: Partial<PlotDefaults['grid']> | true | undefined
) {
    if (input !== true) return input;
    return {
        ...(typeof existing === 'object' ? existing : {}),
        implicit: true
    };
}

function normalizeFrameDefaults(
    input: Partial<PlotDefaults['frame']> | true | undefined,
    existing: Partial<PlotDefaults['frame']> | true | undefined
) {
    if (input !== true) return input;
    return {
        ...(typeof existing === 'object' ? existing : {}),
        implicit: true
    };
}
