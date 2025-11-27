<!-- @component
    Renders a vertical axis with labels and tick marks
-->
<script lang="ts" generics="Datum extends RawValue">
    import { getContext } from 'svelte';
    import BaseAxisY from './helpers/BaseAxisY.svelte';
    import Mark from '../Mark.svelte';
    import type {
        PlotContext,
        BaseMarkProps,
        RawValue,
        FacetContext,
        ChannelName,
        ConstantAccessor
    } from '../types/index.js';
    import autoTimeFormat from '$lib/helpers/autoTimeFormat.js';
    import { autoTicks } from '$lib/helpers/autoTicks.js';
    import { resolveScaledStyles } from '$lib/helpers/resolve.js';
    import { getPlotDefaults } from '$lib/hooks/plotDefaults.js';
    import { extent } from 'd3-array';

    interface AxisYMarkProps extends Omit<
        BaseMarkProps<Datum>,
        'fillOpacity' | 'paintOrder' | 'title' | 'href' | 'target'
    > {
        data?: Datum[];
        automatic?: boolean;
        title?: string | false | null;
        anchor?: 'left' | 'right';
        facetAnchor?: 'auto' | 'left' | 'right' | 'left-empty' | 'right-empty';
        lineAnchor?: 'top' | 'center' | 'bottom';
        interval?: string | number;
        labelAnchor?: 'auto' | 'left' | 'center' | 'right';
        textAnchor?: 'auto' | 'start' | 'middle' | 'end';
        tickSize?: number;
        tickFontSize?: ConstantAccessor<number, Datum>;
        titleFontSize?: number;
        tickPadding?: number;
        tickFormat?:
            | 'auto'
            | Intl.DateTimeFormatOptions
            | Intl.NumberFormatOptions
            | ((d: RawValue) => string);
        tickClass?: ConstantAccessor<string, Datum>;
        /** ticks is a shorthand for defining data, tickCount or interval */
        ticks?: number | string | Datum[];
        /** set to false or null to disable tick labels */
        text?: boolean | null;
        /** approximate number of ticks to be generated */
        tickCount?: number;
        /** approximate number of pixels between generated ticks */
        tickSpacing?: number;
    }

    let markProps: AxisYMarkProps = $props();

    const DEFAULTS: Omit<AxisYMarkProps, 'data' | ChannelName> = {
        tickSize: 6,
        tickPadding: 3,
        tickFontSize: 11,
        opacity: 0.8,
        anchor: 'left',
        textAnchor: 'auto',
        ...getPlotDefaults().axis,
        ...getPlotDefaults().axisY
    };

    const {
        ticks: magicTicks,
        data = Array.isArray(magicTicks) ? magicTicks : [],
        automatic = false,
        title,
        anchor = 'left',
        class: className,
        facetAnchor = 'auto',
        interval = typeof magicTicks === 'string' ? magicTicks : undefined,
        lineAnchor = 'center',
        textAnchor,
        tickSize,
        tickFontSize,
        tickPadding,
        tickFormat,
        tickClass,
        tickCount = typeof magicTicks === 'number' ? magicTicks : undefined,
        tickSpacing,
        text = true,
        ...options
    }: AxisYMarkProps = $derived({ ...DEFAULTS, ...markProps });

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    const autoTickCount = $derived(
        tickCount != null
            ? tickCount
            : tickSpacing != null
              ? Math.max(3, Math.round(plot.facetHeight / tickSpacing))
              : Math.max(2, Math.round(plot.facetHeight / plot.options.y.tickSpacing))
    );

    const ticks: RawValue[] = $derived(
        data.length > 0
            ? // use custom tick values if user passed any as prop
              data
            : // use custom scale tick values if user passed any as plot scale option
              autoTicks(
                  plot.scales.y.type,
                  plot.options.y.ticks,
                  interval || plot.options.y.interval,
                  plot.scales.y.domain,
                  plot.scales.y.fn,
                  autoTickCount
              )
    );

    const useCompactNotation = $derived.by(() => {
        const range =
            extent(plot.scales.y.domain).filter(
                (d): d is number => typeof d === 'number' && Number.isFinite(d)
            ) ?? [];

        if (range[0] === undefined || range[1] === undefined) return false;
        const crossesZero = range[0] <= 0 && range[1] >= 0;
        if (crossesZero) return true;
        const magnitudes = range.map((d) =>
            d === 0 ? -Infinity : Math.floor(Math.log10(Math.abs(d)))
        );
        return magnitudes[0] !== magnitudes[1];
    });

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
                            // use compact notation if range covers multiple magnitudes
                            ...(useCompactNotation ? { notation: 'compact' } : {}),
                            ...DEFAULTS.numberFormat,
                            style: plot.options.y.percent ? 'percent' : 'decimal'
                        }).format(d)
    );

    const optionsLabel = $derived(plot.options.y.label);

    const useTitle = $derived(
        title !== undefined
            ? title || ''
            : optionsLabel === null
              ? null
              : optionsLabel !== undefined
                ? optionsLabel
                : plot.scales.y.autoTitle
                  ? `↑ ${plot.scales.y.autoTitle}${plot.options.y.percent ? ' (%)' : ''}`
                  : ''
    );

    const { getFacetState } = getContext<FacetContext>('svelteplot/facet');
    const { left, leftEmpty, right, rightEmpty, top } = $derived(getFacetState());

    const useFacetAnchor = $derived(
        facetAnchor !== 'auto' ? facetAnchor : anchor === 'left' ? 'left-empty' : 'right-empty'
    );

    const showAxis = $state(
        useFacetAnchor === 'left'
            ? left
            : useFacetAnchor === 'right'
              ? right
              : useFacetAnchor === 'left-empty'
                ? leftEmpty
                : rightEmpty
    );
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
                {
                    opacity: 0.8,
                    ...options,
                    fontSize: options.titleFontSize ?? 11,
                    fill: 'currentColor',
                    stroke: null,
                    textAnchor: anchor === 'left' ? 'start' : 'end'
                },
                {},
                plot,
                'fill'
            )}
            x={anchor === 'left' ? 0 : plot.width}
            y={5}
            class="axis-y-title"
            dominant-baseline="hanging">{useTitle}</text>
    {/if}
    {#if showAxis}
        <BaseAxisY
            {anchor}
            {className}
            {lineAnchor}
            options={{
                ...options,
                textAnchor:
                    textAnchor == null || textAnchor === 'auto'
                        ? anchor === 'left'
                            ? 'end'
                            : 'start'
                        : textAnchor
            }}
            {plot}
            {text}
            {tickClass}
            {tickFontSize}
            {tickPadding}
            {ticks}
            {tickSize}
            marginLeft={plot.options.marginLeft}
            scaleFn={plot.scales.y.fn}
            scaleType={plot.scales.y.type}
            tickFormat={useTickFormat}
            title={useTitle}
            width={plot.facetWidth} />
    {/if}
</Mark>

<style>
    text {
        fill: currentColor;
    }
</style>
