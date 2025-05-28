<!-- @component
    Renders a horizontal axis with labels and tick marks
-->
<script module lang="ts">
    export type AxisXMarkProps = Omit<
        BaseMarkProps,
        'fill' | 'fillOpacity' | 'paintOrder' | 'title' | 'href' | 'target'
    > & {
        data?: RawValue[];
        automatic?: boolean;
        title?: string;
        anchor?: 'top' | 'bottom';
        interval?: string | number;
        facetAnchor?: 'auto' | 'top-empty' | 'bottom-empty' | 'top' | 'bottom';
        labelAnchor?: 'auto' | 'left' | 'center' | 'right';
        tickSize?: number;
        tickFontSize?: ConstantAccessor<number>;
        tickPadding?: number;
        tickFormat?:
            | 'auto'
            | Intl.DateTimeFormatOptions
            | Intl.NumberFormatOptions
            | ((d: RawValue) => string);
        tickClass?: ConstantAccessor<string>;
    };
</script>

<script lang="ts">
    import { getContext } from 'svelte';
    import Mark from '../Mark.svelte';
    import BaseAxisX from './helpers/BaseAxisX.svelte';
    import type {
        PlotContext,
        BaseMarkProps,
        RawValue,
        ConstantAccessor,
        FacetContext,
        DefaultOptions
    } from '../types.js';
    import autoTimeFormat from '$lib/helpers/autoTimeFormat.js';
    import { derived } from 'svelte/store';
    import { autoTicks } from '$lib/helpers/autoTicks.js';
    import { resolveScaledStyles } from '$lib/helpers/resolve.js';

    const DEFAULTS = {
        tickSize: 6,
        tickPadding: 3,
        tickFontSize: 11,
        axisXAnchor: 'bottom',
        ...getContext<Partial<DefaultOptions>>('svelteplot/_defaults')
    };

    let {
        data = [],
        automatic = false,
        title,
        anchor = DEFAULTS.axisXAnchor as 'top' | 'bottom',
        facetAnchor = 'auto',
        interval,
        tickSize = DEFAULTS.tickSize,
        tickFontSize = DEFAULTS.tickFontSize,
        tickPadding = DEFAULTS.tickPadding,
        labelAnchor,
        tickFormat,
        tickClass,
        class: className,
        ...options
    }: AxisXMarkProps = $props();

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    const autoTickCount = $derived(
        Math.max(3, Math.round(plot.facetWidth / plot.options.x.tickSpacing))
    );

    const ticks: RawValue[] = $derived(
        data.length > 0
            ? // use custom tick values if user passed any as prop
              data
            : // use custom scale tick values if user passed any as plot scale option
              autoTicks(
                  plot.scales.x.type,
                  plot.options.x.ticks,
                  interval || plot.options.x.interval,
                  plot.scales.x.domain,
                  plot.scales.x.fn,
                  autoTickCount
              )
    );

    const tickFmt = $derived(tickFormat || plot.options.x.tickFormat);

    const useTickFormat = $derived(
        typeof tickFmt === 'function'
            ? tickFmt
            : plot.scales.x.type === 'band' || plot.scales.x.type === 'point'
              ? (d) => d
              : plot.scales.x.type === 'time'
                ? // time scale
                  typeof tickFmt === 'object'
                    ? (d: Date) => Intl.DateTimeFormat(plot.options.locale, tickFmt).format(d)
                    : autoTimeFormat(plot.scales.x, plot.plotWidth, plot.options.locale)
                : // numeric scale
                  typeof tickFmt === 'object'
                  ? (d: number) => Intl.NumberFormat(plot.options.locale, tickFmt).format(d)
                  : // auto
                    (d: RawValue) =>
                        Intl.NumberFormat(plot.options.locale, {
                            // use compact notation if range covers multipe magnitudes
                            ...(new Set(ticks.map(Math.log10).map(Math.round)).size > 1
                                ? { notation: 'compact' }
                                : {}),
                            ...DEFAULTS.numberFormat,
                            style: plot.options.x.percent ? 'percent' : 'decimal'
                        }).format(d)
    );

    const optionsLabel = $derived(plot.options?.x?.label);
    const scaleType = $derived(plot.scales.x.type);
    const isQuantitative = $derived(scaleType !== 'point' && scaleType !== 'band');

    const useTitle = $derived(
        title ||
            (optionsLabel === null
                ? null
                : optionsLabel !== undefined
                  ? optionsLabel
                  : plot.scales.x.autoTitle
                    ? isQuantitative
                        ? plot.options.x?.reverse
                            ? `← ${plot.scales.x.autoTitle}${plot.options.x.percent ? ' (%)' : ''}`
                            : `${plot.scales.x.autoTitle}${plot.options.x.percent ? ' (%)' : ''} →`
                        : plot.scales.x.autoTitle
                    : '')
    );

    const useLabelAnchor = $derived(labelAnchor || plot.options?.x?.labelAnchor || 'auto');
    const titleAlign = $derived(
        useLabelAnchor === 'auto' ? (isQuantitative ? 'right' : 'center') : useLabelAnchor
    );

    const { getFacetState } = getContext<FacetContext>('svelteplot/facet');
    const { left, top, bottom, bottomEmpty, topEmpty } = $derived(getFacetState());

    const useFacetAnchor = $derived(
        facetAnchor !== 'auto' ? facetAnchor : anchor === 'bottom' ? 'bottom-empty' : 'top-empty'
    );
    const showAxis = $derived(
        useFacetAnchor === 'top'
            ? top
            : useFacetAnchor === 'bottom'
              ? bottom
              : useFacetAnchor === 'top-empty'
                ? topEmpty
                : bottomEmpty
    );
</script>

<Mark
    type="axisX"
    data={data.length ? data.map((tick) => ({ __x: tick })) : []}
    channels={['x']}
    {...options}
    x="__x"
    {automatic}>
    {#if left && top && useTitle}
        <text
            style={resolveScaledStyles(
                null,
                {
                    ...options,
                    stroke: null,
                    textAnchor:
                        titleAlign === 'right'
                            ? 'end'
                            : titleAlign === 'center'
                              ? 'middle'
                              : 'start'
                },
                {},
                plot,
                'fill'
            )}
            x={plot.options.marginLeft +
                plot.plotWidth * (titleAlign === 'right' ? 1 : titleAlign === 'center' ? 0.5 : 0)}
            y={anchor === 'top' ? 13 : plot.height - 13}
            class="axis-x-title"
            dominant-baseline={anchor === 'top' ? 'auto' : 'hanging'}>{useTitle}</text>
    {/if}
    {#if showAxis}
        <BaseAxisX
            scaleFn={plot.scales.x.fn}
            scaleType={plot.scales.x.type}
            tickFormat={useTickFormat}
            {ticks}
            marginTop={plot.options.marginTop}
            height={plot.facetHeight}
            {anchor}
            {tickSize}
            {tickPadding}
            {tickFontSize}
            {tickClass}
            {options}
            title={useTitle}
            {plot} />
    {/if}
</Mark>

<style>
    text {
        font-size: 11px;
        opacity: 0.8;
        fill: currentColor;
    }
</style>
