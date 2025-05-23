<script lang="ts">
    import { getContext } from 'svelte';
    import BaseAxisY from './helpers/BaseAxisY.svelte';
    import Mark from '../Mark.svelte';
    import type {
        PlotContext,
        BaseMarkProps,
        RawValue,
        FacetContext,
        DefaultOptions
    } from '../types.js';
    import autoTimeFormat from '$lib/helpers/autoTimeFormat.js';
    import type { ConstantAccessor } from '$lib/types.js';
    import { autoTicks } from '$lib/helpers/autoTicks.js';
    import { resolveScaledStyles } from '$lib/helpers/resolve.js';

    const DEFAULTS = {
        tickSize: 6,
        tickPadding: 3,
        tickFontSize: 11,
        axisYAnchor: 'left',
        ...getContext<Partial<DefaultOptions>>('svelteplot/_defaults')
    };

    type AxisYProps = BaseMarkProps & {
        data?: RawValue[];
        automatic?: boolean;
        title?: string;
        anchor?: 'left' | 'right';
        facetAnchor?: 'auto' | 'left' | 'right' | 'left-empty' | 'right-empty';
        lineAnchor?: 'top' | 'center' | 'bottom';
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

    const theme = getContext('svelteplot/theme');
    const p = $props();
    let {
        data = [],
        automatic = false,
        title,
        anchor = DEFAULTS.axisYAnchor,
        facetAnchor = 'auto',
        lineAnchor = 'center',
        tickSize = DEFAULTS.tickSize,
        tickFontSize = DEFAULTS.tickFontSize,
        tickPadding = DEFAULTS.tickPadding,
        tickFormat,
        tickClass,
        ...options
    }: AxisYProps = { ...(theme?.marks?.axisY || {}), ...p };

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    const autoTickCount = $derived(
        Math.max(2, Math.round(plot.facetHeight / plot.options.y.tickSpacing))
    );

    const ticks: RawValue[] = $derived(
        data.length > 0
            ? // use custom tick values if user passed any as prop
              data
            : // use custom scale tick values if user passed any as plot scale option
              autoTicks(
                  plot.scales.y.type,
                  plot.options.y.ticks,
                  plot.options.y.interval,
                  plot.scales.y.domain,
                  plot.scales.y.fn,
                  autoTickCount
              )
    );

    const tickFmt = $derived(tickFormat || plot.options.y.tickFormat);

    const useTickFormat = $derived(
        typeof tickFmt === 'function'
            ? tickFmt
            : plot.scales.y.type === 'band' || plot.scales.y.type === 'point'
              ? (d) => d
              : plot.scales.y.type === 'time'
                ? // time scale
                  typeof tickFmt === 'object'
                    ? (d: Date) => Intl.DateTimeFormat(plot.options.locale, tickFmt).format(d)
                    : autoTimeFormat(plot.scales.y, plot.plotWidth, plot.options.locale)
                : // numeric scale
                  typeof tickFmt === 'object'
                  ? (d: number) => Intl.NumberFormat(plot.options.locale, tickFmt).format(d)
                  : // auto
                    (d: RawValue) =>
                        Intl.NumberFormat(plot.options.locale, {
                            ...DEFAULTS.numberFormat,
                            style: plot.options.y.percent ? 'percent' : 'decimal'
                        }).format(d)
    );

    const optionsLabel = $derived(plot.options.y.label);

    const useTitle = $derived(
        title ||
            (optionsLabel === null
                ? null
                : optionsLabel !== undefined
                  ? optionsLabel
                  : plot.scales.y.autoTitle
                    ? `↑ ${plot.scales.y.autoTitle}${plot.options.y.percent ? ' (%)' : ''}`
                    : '')
    );

    const { getFacetState } = getContext<FacetContext>('svelteplot/facet');
    const { left, leftEmpty, right, rightEmpty, top } = $derived(getFacetState());

    const useFacetAnchor = $derived(
        facetAnchor !== 'auto' ? facetAnchor : anchor === 'left' ? 'left-empty' : 'right-empty'
    );

    let showAxis = $state(false);
    $effect.pre(() => {
        showAxis =
            useFacetAnchor === 'left'
                ? left
                : useFacetAnchor === 'right'
                  ? right
                  : useFacetAnchor === 'left-empty'
                    ? leftEmpty
                    : rightEmpty;
    });
</script>

<Mark
    type="axisY"
    data={data.length ? data.map((tick) => ({ __y: tick })) : []}
    channels={['y']}
    {...{ ...options, y: '__y' }}
    {automatic}>
    {#if left && top && useTitle}
        <text
            style={resolveScaledStyles(
                null,
                { ...options, stroke: null, textAnchor: anchor === 'left' ? 'start' : 'end' },
                {},
                plot,
                'fill'
            )}
            x={anchor === 'left' ? 0 : plot.width}
            y={5}
            class="axis-x-title"
            dominant-baseline="hanging">{useTitle}</text>
    {/if}
    {#if showAxis}
        <BaseAxisY
            scaleFn={plot.scales.y.fn}
            scaleType={plot.scales.y.type}
            tickFormat={useTickFormat}
            {ticks}
            marginLeft={plot.options.marginLeft}
            width={plot.facetWidth}
            {anchor}
            {lineAnchor}
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
