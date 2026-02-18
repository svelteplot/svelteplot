import { getContext } from 'svelte';
import type { PlotContext, PlotOptions } from 'svelteplot/types/plot';
import type { PlotScales, PlotState as TPlotState } from 'svelteplot/types';

/**
 * internal state representation of a Plot, using Svelte 5 runes for reactivity
 */
class PlotState implements TPlotState {
    width: number = $state(50);
    height: number = $state(50);
    options: PlotOptions = $state({} as PlotOptions);
    facetWidth: number = $state(0);
    facetHeight: number = $state(0);
    plotWidth: number = $state(0);
    plotHeight: number = $state(0);
    scales: PlotScales = $state(undefined as unknown as PlotScales);
    body: HTMLDivElement = $state(undefined as unknown as HTMLDivElement);
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

    /** merges partial state into the current plot state */
    update(newState: Partial<PlotState>) {
        Object.assign(this, newState);
    }

    /** returns a read-only wrapper exposing only public properties */
    get publicState(): Readonly<TPlotState> {
        return new PublicPlotState(this) as unknown as Readonly<TPlotState>;
    }
}

/** read-only wrapper around PlotState that exposes only getter properties */
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
    get css() {
        return this.#plotState.css;
    }
}

/** creates a new PlotState instance from the given initial state */
export function setPlot(initialState: TPlotState): PlotState {
    return new PlotState({
        ...initialState
    } as PlotState);
}

/** returns the current Plot's public state from Svelte context. Must be called within a `<Plot>` component tree. */
export function usePlot(): Readonly<TPlotState> {
    const { getPlotState } = getContext<PlotContext>('svelteplot');
    return getPlotState().publicState;
}
