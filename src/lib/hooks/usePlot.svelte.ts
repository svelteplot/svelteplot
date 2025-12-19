import { getContext } from 'svelte';
import type { Plot } from 'svelteplot';
import type { PlotScales } from 'svelteplot/types';
import type { PlotContext, PlotOptions } from 'svelteplot/types/plot';

class PlotState {
    // Define properties and methods for PlotState as needed
    width: number = $state(50);
    height: number = $state(50);
    options: PlotOptions = $state({});
    facetWidth: number = $state(0);
    facetHeight: number = $state(0);
    plotWidth: number = $state(0);
    plotHeight: number = $state(0);
    scales: PlotScales = $state();
    body: HTMLDivElement = $state();
    /**
     * True if there's a color scale and a symbol scale and both are bound to the same
     * single channel accessor.
     */
    colorSymbolRedundant: boolean = $state(false);
    /**
     * True if the plot is using filled dot marks.
     */
    hasFilledDotMarks: boolean = $state(false);
    css: ((d: string) => string) | null = $state(null);

    constructor(state: PlotState) {
        // Initialization code here
        Object.assign(this, state);
    }

    update(newState: Partial<PlotState>) {
        Object.assign(this, newState);
    }
}

class PublicPlotState {
    #plotState: PlotState;
    constructor(plotState: PlotState) {
        this.#plotState = plotState;
    }

    get width() {
        return this.#plotState.width;
    }
    get height() {
        return this.#plotState.height;
    }
    get options() {
        return this.#plotState.options;
    }
    get scales() {
        return this.#plotState.scales;
    }
    get plotWidth() {
        return this.#plotState.plotWidth;
    }
    get plotHeight() {
        return this.#plotState.plotHeight;
    }
    get facetWidth() {
        return this.#plotState.facetWidth;
    }
    get facetHeight() {
        return this.#plotState.facetHeight;
    }
    get body() {
        return this.#plotState.body;
    }
    get colorSymbolRedundant() {
        return this.#plotState.colorSymbolRedundant;
    }
    get hasFilledDotMarks() {
        return this.#plotState.hasFilledDotMarks;
    }
}

let state: PlotState | null = null;
let publicState: PublicPlotState | null = null;

export function setPlot(initialState: PlotState): PlotState {
    if (!state) {
        state = new PlotState({
            ...initialState
        });
        publicState = new PublicPlotState(state);
    }
    return state;
}

export function usePlot(): PlotState {
    if (!publicState) {
        throw new Error('usePlot must be used within a Plot component');
    }
    return publicState;
}
