<!--
    @component
    The core Plot component handles the main layout of the plot but it does not
    include smart automatic scales and marks. It is to be used in cases where
    you want to reduce the footprint of the plot to the bare minimum.

    Keep in mind that you will have to create your own scales if you're using
    this component. 
-->
<script lang="ts">
    import { setContext } from 'svelte';
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
        RawValue,
        PlotMargin
    } from '../types/index.js';
    import FacetGrid from './FacetGrid.svelte';

    import mergeDeep from '../helpers/mergeDeep.js';
    import { computeScales, projectXY } from '../helpers/scales.js';
    import { CHANNEL_SCALE, SCALES } from '../constants.js';
    import { getPlotDefaults, setPlotDefaults } from 'svelteplot/hooks/plotDefaults.js';
    import { maybeNumber } from 'svelteplot/helpers/index.js';
    import { setPlot, usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

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

    const USER_DEFAULTS = getPlotDefaults();

    // default settings in the plot and marks can be overwritten by
    // defining the svelteplot/defaults context outside of Plot
    const DEFAULTS: PlotDefaults = {
        height: 350,
        initialWidth: 500,
        inset: 0,
        margin: 'auto',
        colorScheme: 'turbo',
        unknown: '#cccccc99',
        sortOrdinalDomains: true,
        categoricalColorScheme: 'observable10',
        pointScaleHeight: 20,
        bandScaleHeight: 30,
        locale: 'en-US',
        numberFormat: {
            style: 'decimal',
            // notation: 'compact',
            useGrouping: 'min2',
            compactDisplay: 'short'
        },
        markerDotRadius: 3,
        ...USER_DEFAULTS,
        axisX: {
            anchor: 'bottom',
            implicit: true,
            ...USER_DEFAULTS.axis,
            ...USER_DEFAULTS.axisX
        },
        axisY: {
            anchor: 'left',
            implicit: true,
            ...USER_DEFAULTS.axis,
            ...USER_DEFAULTS.axisY
        },
        gridX: {
            implicit: false,
            ...USER_DEFAULTS.grid,
            ...USER_DEFAULTS.gridX
        },
        gridY: {
            implicit: false,
            ...USER_DEFAULTS.grid,
            ...USER_DEFAULTS.gridY
        }
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
        ...initialOptions
    }: Partial<PlotOptions> = $props();

    let width = $state(DEFAULTS.initialWidth);

    setPlotDefaults(DEFAULTS);

    // information that influences the default plot options
    type PlotOptionsParameters = {
        explicitScales: Set<ScaleName>;
        explicitDomains: Set<ScaleName>;
        hasProjection: boolean;
        margin?: number | 'auto';
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
        new Set(SCALES.filter((scale) => !!initialOptions[scale]?.domain))
    );

    // one-dimensional plots have different automatic margins and heights
    const isOneDimensional = $derived(explicitScales.has('x') !== explicitScales.has('y'));

    // construct the plot options from the user-defined options (top-level props) as well
    // as extending them from smart context-aware defaults
    const plotOptions = $derived(
        extendPlotOptions(initialOptions, {
            explicitScales,
            explicitDomains,
            hasProjection: !!initialOptions.projection,
            margin: initialOptions.margin,
            inset: initialOptions.inset
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

    const defaultPointScaleHeight = $derived(
        explicitScales.has('r') && plotOptions.r.range
            ? plotOptions.r.range[1] * 2
            : DEFAULTS.pointScaleHeight
    );

    // compute the (automatic) height based on various factors:
    // - if the plot used a projection and the projection requires an aspect ratio,
    //   we use it, but adjust for the facet counts
    // - if the user defined a domain-aspect ratio, we use the heightFromAspect
    //   method to compute the height based on the preliminary x and y scales
    // - for one-dimensional scales using the x scale we set a fixed height
    // - for y band-scales we use the number of items in the y domain
    const height = $derived(
        typeof plotOptions.height === 'function'
            ? plotOptions.height(plotWidth)
            : maybeNumber(plotOptions.height) === null || plotOptions.height === 'auto'
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
                                    ? yFacetCount * yDomainCount * defaultPointScaleHeight
                                    : DEFAULTS.height) +
                            plotOptions.marginTop +
                            plotOptions.marginBottom
                )
              : maybeNumber(plotOptions.height)
    );

    const plotHeight = $derived(height - plotOptions.marginTop - plotOptions.marginBottom);

    // TODO: check if there's still a reason to store and expose the plot body element
    let plotBody: HTMLDivElement | null = $state(null);

    let facetWidth: number | null = $state(null);
    let facetHeight: number | null = $state(null);

    let plotState = setPlot(computePlotState());

    $effect(() => {
        plotState.update(computePlotState());
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
            plotState.update(computePlotState());
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
        return mergeDeep<PlotOptions>(
            {},
            { sortOrdinalDomains: DEFAULTS.sortOrdinalDomains },
            smartDefaultPlotOptions(opts),
            initialOptions
        );
    }

    function maybeMargin(
        // the margin option provided to the <Plot> component
        margin: number | 'auto' | PlotMargin | undefined,
        // direction to extract from the margin object
        direction: 'left' | 'right' | 'top' | 'bottom',
        // the margin option defined in the plot defaults
        defaultValue: PlotMargin | number | 'auto',
        // automatic margins computed from the marks
        autoMargins: {
            left: number;
            right: number;
            top: number;
            bottom: number;
        }
    ): number {
        // direction-specific margin value takes precedence
        const marginValue =
            typeof margin === 'object' && margin[direction] != null
                ? margin[direction]
                : // use the margin value if it's a number
                  typeof margin === 'number' || margin === 'auto'
                  ? margin
                  : // use direction-specific default value if defined
                    typeof defaultValue === 'object' && defaultValue[direction] != null
                    ? defaultValue[direction]
                    : typeof defaultValue === 'number' || defaultValue === 'auto'
                      ? defaultValue
                      : 'auto';

        return marginValue === 'auto' ? autoMargins[direction] : marginValue;
    }

    /**
     * compute smart default options for the plot based on the scales and marks
     */
    function smartDefaultPlotOptions({
        explicitScales,
        explicitDomains,
        hasProjection,
        margin
    }: PlotOptionsParameters): PlotOptions {
        const autoXAxis = explicitScales.has('x') || explicitDomains.has('x');
        const autoYAxis = explicitScales.has('y') || explicitDomains.has('y');
        const isOneDimensional = autoXAxis !== autoYAxis;
        const oneDimX = autoXAxis && !autoYAxis;
        const oneDimY = autoYAxis && !autoXAxis;

        const autoMargins = {
            left: hasProjection ? 0 : Math.max(maxMarginLeft + 1, 1),
            right: hasProjection ? 0 : oneDimY ? 0 : Math.max(maxMarginRight + 1, 4),
            top: hasProjection ? 0 : oneDimX ? 0 : Math.max(5, maxMarginTop),
            bottom: hasProjection ? 0 : Math.max(5, maxMarginBottom)
        };

        return {
            title: '',
            subtitle: '',
            caption: '',
            height: 'auto',
            // maxWidth: oneDimY ? `${60 * e}px` : undefined,
            marginLeft: maybeMargin(margin, 'left', DEFAULTS.margin, autoMargins),
            marginRight: maybeMargin(margin, 'right', DEFAULTS.margin, autoMargins),
            marginTop: maybeMargin(margin, 'top', DEFAULTS.margin, autoMargins),
            marginBottom: maybeMargin(margin, 'bottom', DEFAULTS.margin, autoMargins),
            inset: isOneDimensional ? 10 : DEFAULTS.inset,
            grid: (DEFAULTS.gridX?.implicit ?? false) && (DEFAULTS.gridY?.implicit ?? false),
            axes: (DEFAULTS.axisX?.implicit ?? false) && (DEFAULTS.axisY?.implicit ?? false),
            frame: DEFAULTS.frame?.implicit ?? false,
            projection: null,
            aspectRatio: null,
            facet: {},
            padding: 0.1,
            x: {
                type: 'auto',
                axis: DEFAULTS.axisX.implicit && autoXAxis ? DEFAULTS.axisX.anchor : false,
                labelAnchor: 'auto',
                reverse: false,
                clamp: false,
                nice: false,
                zero: false,
                round: false,
                percent: false,
                align: 0.5,
                tickSpacing: DEFAULTS.axisX.tickSpacing ?? 80,
                tickFormat: 'auto',
                grid: DEFAULTS.gridX.implicit ?? false
            },
            y: {
                type: 'auto',
                axis: DEFAULTS.axisY.implicit && autoYAxis ? DEFAULTS.axisY.anchor : false,
                labelAnchor: 'auto',
                reverse: false,
                clamp: false,
                nice: false,
                zero: false,
                round: false,
                percent: false,
                align: 0.5,
                tickSpacing: DEFAULTS.axisY.tickSpacing ?? 50,
                tickFormat: 'auto',
                grid: DEFAULTS.gridY.implicit ?? false
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
            color: { type: 'auto', unknown: DEFAULTS.unknown },
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
            viewBox="0 0 {width} {height}">
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
        {#if overlay}<div class="plot-overlay">
                {@render overlay?.({
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
            </div>{/if}
    </div>
    {#if footer}
        <figcaption class="plot-footer">
            {@render footer?.()}
        </figcaption>
    {/if}
</figure>

<style>
    figure {
        --svp-bg: var(--svelteplot-bg, white);
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

    .plot-footer {
        margin-bottom: 2rem;
    }
</style>
