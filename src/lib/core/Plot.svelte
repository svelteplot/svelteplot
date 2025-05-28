<!--
    @component
    The core Plot component handles the main layout of the plot but it does not
    include smart automatic scales and marks. It is to be used in cases where
    you want to reduce the footprint of the plot to the bare minimum.

    Keep in mind that you will have to create your own scales if you're using
    this component. 
-->
<script lang="ts">
    import { getContext, setContext } from 'svelte';
    import { SvelteMap } from 'svelte/reactivity';
    import { writable } from 'svelte/store';

    import type {
        PlotOptions,
        GenericMarkOptions,
        Mark,
        PlotScales,
        ScaleName,
        PlotScale,
        PlotDefaults,
        PlotState,
        RawValue
    } from '../types.js';
    import FacetGrid from './FacetGrid.svelte';

    import mergeDeep from '../helpers/mergeDeep.js';
    import { computeScales, projectXY } from '../helpers/scales.js';
    import { CHANNEL_SCALE, SCALES } from '../constants.js';

    // automatic margins can be applied by the marks, registered
    // with their respective unique identifier as keys
    let autoMarginLeft = writable(new SvelteMap<string, number>());
    let autoMarginRight = writable(new SvelteMap<string, number>());
    let autoMarginBottom = writable(new SvelteMap<string, number>());
    let autoMarginTop = writable(new SvelteMap<string, number>());

    // autoMargin stores are shared via context
    setContext('svelteplot/autoMargins', {
        autoMarginLeft,
        autoMarginRight,
        autoMarginBottom,
        autoMarginTop
    });

    // compute maximum margins to either side of the plot from the
    // automatic margins defined by marks
    const maxMarginLeft = $derived(Math.max(...$autoMarginLeft.values()));
    const maxMarginRight = $derived(Math.max(...$autoMarginRight.values()));
    const maxMarginBottom = $derived(Math.max(...$autoMarginBottom.values()));
    const maxMarginTop = $derived(Math.max(...$autoMarginTop.values()));

    // default settings in the plot and marks can be overwritten by
    // defining the svelteplot/defaults context outside of Plot
    const DEFAULTS: PlotDefaults = {
        axisXAnchor: 'bottom',
        axisYAnchor: 'left',
        xTickSpacing: 80,
        yTickSpacing: 50,
        height: 350,
        initialWidth: 500,
        inset: 0,
        colorScheme: 'turbo',
        unknown: '#cccccc',
        dotRadius: 3,
        frame: false,
        axes: true,
        grid: false,
        categoricalColorScheme: 'observable10',
        pointScaleHeight: 18,
        bandScaleHeight: 30,
        locale: 'en-US',
        numberFormat: {
            style: 'decimal',
            // notation: 'compact',
            compactDisplay: 'short'
        },
        markerDotRadius: 3,
        ...getContext<Partial<PlotDefaults>>('svelteplot/defaults')
    };

    let {
        header,
        footer,
        overlay,
        underlay,
        children,
        facetAxes,
        testid,
        facet,
        class: className = '',
        css = DEFAULTS.css,
        width: fixedWidth,
        ...initialOpts
    }: Partial<PlotOptions> = $props();

    let width = $state(DEFAULTS.initialWidth);

    setContext('svelteplot/_defaults', DEFAULTS);

    // information that influences the default plot options
    type PlotOptionsParameters = {
        explicitScales: Set<ScaleName>;
        explicitDomains: Set<ScaleName>;
        hasProjection: boolean;
        margins?: number;
        inset?: number;
    };

    /**
     * the marks used in the plot
     */
    let marks = $state.raw<Mark<GenericMarkOptions>[]>([]);

    /**
     *
     */
    const explicitMarks = $derived(marks.filter((m) => !m.options.automatic));

    // knowing if the plot includes explicit grids and marks is useful for
    // including the automatic/implicit axes/grids
    const hasExplicitAxisX = $derived(!!explicitMarks.find((m) => m.type === 'axisX'));
    const hasExplicitAxisY = $derived(!!explicitMarks.find((m) => m.type === 'axisY'));
    const hasExplicitGridX = $derived(!!explicitMarks.find((m) => m.type === 'gridX'));
    const hasExplicitGridY = $derived(!!explicitMarks.find((m) => m.type === 'gridY'));

    const explicitScales = $derived(
        new Set(
            explicitMarks
                .map((m) =>
                    [...m.scales.values()].filter((scale) => {
                        // remove the scales where no input channels are defined for this mark
                        const channels = Object.entries(CHANNEL_SCALE)
                            .filter(([, scaleName]) => scale === scaleName)
                            .map(([channel]) => channel);
                        return channels.find((channel) => m.options[channel] != null);
                    })
                )
                .flat(1)
        )
    );

    const explicitDomains = $derived(
        new Set(SCALES.filter((scale) => !!initialOpts[scale]?.domain))
    );

    // one-dimensional plots have different automatic margins and heights
    const isOneDimensional = $derived(explicitScales.has('x') !== explicitScales.has('y'));

    // construct the plot options from the user-defined options (top-level props) as well
    // as extending them from smart context-aware defaults
    const plotOptions = $derived(
        extendPlotOptions(initialOpts, {
            explicitScales,
            explicitDomains,
            hasProjection: !!initialOpts.projection,
            margins: initialOpts.margins,
            inset: initialOpts.inset
        })
    );

    // if the plot is showing filled dot marks we're using different defaults
    // for the symbol axis range, so we're passing on this info to the computeScales
    // function below
    const hasFilledDotMarks = $derived(
        !!explicitMarks.find((d) => d.type === 'dot' && d.options.fill)
    );

    // compute preliminary scales with a fixed height, since we don't have
    // height defined at this point, but still need some of the scales
    const preScales: PlotScales = $derived(
        computeScales(plotOptions, width, 400, hasFilledDotMarks, marks, DEFAULTS)
    );

    const hasProjection = $derived(!!preScales.projection);

    const plotWidth = $derived(
        (fixedWidth || width) - plotOptions.marginLeft - plotOptions.marginRight
    );

    // the facet and y domain counts are used for computing the automatic height
    const xFacetCount = $derived(Math.max(1, preScales.fx.domain.length));
    const yFacetCount = $derived(Math.max(1, preScales.fy.domain.length));
    const yDomainCount = $derived(
        isOneDimensional && explicitScales.has('x') ? 1 : preScales.y.domain.length
    );
    // compute the (automatic) height based on various factors:
    // - if the plot used a projection and the projection requires an aspect ratio,
    //   we use it, but adjust for the facet counts
    // - if the user defined a domain-aspect ratio, we use the heightFromAspect
    //   method to compute the height based on the preliminary x and y scales
    // - for one-dimensional scales using the x scale we set a fixed height
    // - for y band-scales we use the number of items in the y domain
    const height = $derived(
        plotOptions.height === 'auto'
            ? Math.round(
                  preScales.projection && preScales.projection.aspectRatio
                      ? ((plotWidth * preScales.projection.aspectRatio) / xFacetCount) *
                            yFacetCount +
                            plotOptions.marginTop +
                            plotOptions.marginBottom
                      : plotOptions.aspectRatio
                        ? heightFromAspect(
                              preScales.x,
                              preScales.y,
                              plotOptions.aspectRatio,
                              plotWidth,
                              plotOptions.marginTop,
                              plotOptions.marginBottom
                          )
                        : ((isOneDimensional && explicitScales.has('x')) || !explicitMarks.length
                              ? yFacetCount * DEFAULTS.bandScaleHeight
                              : preScales.y.type === 'band'
                                ? yFacetCount * yDomainCount * DEFAULTS.bandScaleHeight
                                : preScales.y.type === 'point'
                                  ? yFacetCount * yDomainCount * DEFAULTS.pointScaleHeight
                                  : DEFAULTS.height) +
                          plotOptions.marginTop +
                          plotOptions.marginBottom
              )
            : typeof plotOptions.height === 'function'
              ? plotOptions.height(plotWidth)
              : plotOptions.height
    );

    const plotHeight = $derived(height - plotOptions.marginTop - plotOptions.marginBottom);

    // TODO: check if there's still a reason to store and expose the plot body element
    let plotBody: HTMLDivElement | null = $state(null);

    let facetWidth: number | null = $state(null);
    let facetHeight: number | null = $state(null);

    // eslint-disable-next-line svelte/prefer-writable-derived
    let plotState: PlotState = $state(computePlotState());

    $effect(() => {
        plotState = computePlotState();
    });

    function computePlotState() {
        // now that we know the actual height and facet dimensions, we can compute
        // the scales used in all the marks
        const scales = computeScales(
            plotOptions,
            facetWidth || width,
            facetHeight || height,
            hasFilledDotMarks,
            marks,
            DEFAULTS
        );
        const colorSymbolRedundant =
            scales.color.uniqueScaleProps?.size === 1 &&
            scales.symbol.uniqueScaleProps?.size === 1 &&
            [...scales.color.uniqueScaleProps?.values()][0] ===
                [...scales.symbol.uniqueScaleProps?.values()][0];
        return {
            options: plotOptions,
            width,
            height,
            facetWidth,
            facetHeight,
            plotHeight,
            plotWidth,
            scales,
            colorSymbolRedundant,
            hasFilledDotMarks,
            body: plotBody,
            css
        };
    }

    setContext('svelteplot', {
        /**
         * used by the Mark component to register new marks to the plot
         */
        addMark(mark: Mark<GenericMarkOptions>) {
            if (marks.find((m) => m.id === mark.id)) {
                return;
            }

            marks = [...marks, mark];
        },
        /**
         * used by the Mark component to update marks when its props change
         */
        updateMark(mark: Mark<GenericMarkOptions>) {
            // marks = marks.map((m) => (m.id === mark.id ? mark : m));
        },
        /**
         * used by the Mark component to unregister marks when their
         * respective components get removed from the plot
         */
        removeMark(mark: Mark<GenericMarkOptions>) {
            marks = marks.filter((m) => m.id !== mark.id);
        },
        getPlotState() {
            return plotState;
        },
        getTopLevelFacet() {
            // we need to expose the facet options to allow marks to
            // react to state changes by updating the fx and fy channels
            return facet;
        },
        updateDimensions(w: number, h: number) {
            if (facetWidth !== w) facetWidth = w;
            if (facetHeight !== h) facetHeight = h;
        },
        updatePlotState() {
            plotState = computePlotState();
        }
    });

    // TODO: perhaps we don't need this anymore
    export function getWidth() {
        return width;
    }

    function heightFromAspect(
        x: PlotScale,
        y: PlotScale,
        aspectRatio: number,
        plotWidth: number,
        marginTop: number,
        marginBottom: number
    ) {
        const xDomainExtent =
            x.type === 'band' || x.type === 'point'
                ? x.domain.length
                : Math.abs(x.domain[1] - x.domain[0]);
        const yDomainExtent =
            y.type === 'band' || y.type === 'point'
                ? y.domain.length
                : Math.abs(y.domain[1] - y.domain[0]);
        return (
            ((plotWidth / xDomainExtent) * yDomainExtent) / aspectRatio + marginTop + marginBottom
        );
    }

    function extendPlotOptions(
        initialOpts: Partial<PlotOptions>,
        opts: PlotOptionsParameters
    ): PlotOptions {
        return mergeDeep<PlotOptions>({}, smartDefaultPlotOptions(opts), initialOpts);
    }

    /**
     * compute smart default options for the plot based on the scales and marks
     */
    function smartDefaultPlotOptions({
        explicitScales,
        explicitDomains,
        hasProjection,
        margins
    }: PlotOptionsParameters): PlotOptions {
        const autoXAxis = explicitScales.has('x') || explicitDomains.has('x');
        const autoYAxis = explicitScales.has('y') || explicitDomains.has('y');
        const isOneDimensional = autoXAxis !== autoYAxis;
        const oneDimX = autoXAxis && !autoYAxis;
        const oneDimY = autoYAxis && !autoXAxis;
        return {
            title: '',
            subtitle: '',
            caption: '',
            height: 'auto',
            // maxWidth: oneDimY ? `${60 * e}px` : undefined,
            marginLeft: hasProjection
                ? 0
                : margins != null
                  ? margins
                  : Math.max(maxMarginLeft + 1, 1),
            marginRight: hasProjection
                ? 0
                : margins != null
                  ? margins
                  : oneDimY
                    ? 0
                    : Math.max(maxMarginRight + 1, 4),
            marginTop: hasProjection
                ? 0
                : margins != null
                  ? margins
                  : oneDimX
                    ? 0
                    : Math.max(5, maxMarginTop),
            marginBottom: hasProjection
                ? 0
                : margins != null
                  ? margins
                  : Math.max(5, maxMarginBottom),
            inset: isOneDimensional ? 10 : DEFAULTS.inset,
            grid: DEFAULTS.grid,
            axes: DEFAULTS.axes,
            frame: DEFAULTS.frame,
            projection: null,
            aspectRatio: null,
            facet: {},
            padding: 0.1,
            x: {
                type: 'auto',
                axis: autoXAxis ? DEFAULTS.axisXAnchor : false,
                labelAnchor: 'auto',
                reverse: false,
                clamp: false,
                nice: false,
                zero: false,
                round: false,
                percent: false,
                align: 0.5,
                tickSpacing: DEFAULTS.xTickSpacing,
                tickFormat: 'auto',
                grid: false
            },
            y: {
                type: 'auto',
                axis: autoYAxis ? DEFAULTS.axisYAnchor : false,
                labelAnchor: 'auto',
                reverse: false,
                clamp: false,
                nice: false,
                zero: false,
                round: false,
                percent: false,
                align: 0.5,
                tickSpacing: DEFAULTS.yTickSpacing,
                tickFormat: 'auto',
                grid: false
            },
            opacity: {
                type: 'linear',
                reverse: false,
                clamp: false,
                nice: false,
                zero: false,
                round: false,
                tickSpacing: 0,
                percent: false,
                padding: 0.1,
                align: 0.5
            },
            r: {
                type: 'sqrt',
                reverse: false,
                clamp: false,
                nice: false,
                zero: true,
                percent: false,
                round: false,
                padding: 0,
                align: 0
            },
            color: { type: 'auto' },
            length: { type: 'linear' },
            symbol: { type: 'ordinal' },
            fx: { type: 'band', axis: 'top' },
            fy: { type: 'band', axis: 'right' },
            locale: DEFAULTS.locale,
            css: DEFAULTS.css
        };
    }

    const mapXY = $derived((x: RawValue, y: RawValue) => {
        const [px, py] = projectXY(plotState.scales, x, y);
        return { x: px, y: py };
    });
</script>

<figure
    class="svelteplot {className}"
    bind:clientWidth={width}
    style:max-width={plotOptions.maxWidth}
    data-testid={testid}>
    {#if header}
        <div class="plot-header">
            {@render header?.()}
        </div>
    {/if}
    <div class="plot-body" bind:this={plotBody}>
        {#if underlay}<div class="plot-underlay">{@render underlay(plotOptions)}</div>{/if}
        <svg
            width={fixedWidth || width}
            {height}
            fill="currentColor"
            viewBox="0 0 {width} {height}"
            font-family="system-ui, sans-serif">
            {@render facetAxes?.()}
            <FacetGrid marks={explicitMarks}>
                {#if children}
                    {@render children({
                        width,
                        height,
                        options: plotOptions,
                        scales: plotState.scales,
                        mapXY,
                        hasProjection,
                        hasExplicitAxisX,
                        hasExplicitAxisY,
                        hasExplicitGridX,
                        hasExplicitGridY
                    })}
                {/if}
            </FacetGrid>
        </svg>
        {#if overlay}<div class="plot-overlay">{@render overlay?.()}</div>{/if}
    </div>
    {#if footer}
        <figcaption class="plot-footer">
            {@render footer?.()}
        </figcaption>
    {/if}
</figure>

<style>
    :root {
        --plot-bg: white;
        --plot-fg: currentColor;
    }

    figure {
        margin: 0;
        padding: 0;
    }

    .plot-body {
        position: relative;
    }

    .plot-overlay,
    .plot-underlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
    }

    .plot-underlay {
        z-index: -1;
    }

    .plot-header {
        margin-top: 1rem;
        display: flex;
        flex-direction: column;
        row-gap: 0.35rem;
    }

    .plot-header :global(h2),
    .plot-header :global(h3) {
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
    }

    .plot-header :global(h3) {
        font-weight: 500;
    }

    .plot-footer {
        margin-bottom: 2rem;
    }

    .plot-footer :global(> div) {
        font-size: 12px;
        font-style: italic;
        opacity: 0.7;
    }
</style>
