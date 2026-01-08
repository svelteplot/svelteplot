<!-- @component
    Renders a horizontal axis with labels and tick marks
-->
<script lang="ts" generics="Datum extends RawValue">
    import { getContext } from 'svelte';
    import Mark from '../Mark.svelte';
    import BaseAxisX from './helpers/BaseAxisX.svelte';
    import type {
        BaseMarkProps,
        RawValue,
        ConstantAccessor,
        FacetContext,
        ChannelName
    } from '../types/index.js';
    import type * as CSS from 'csstype';
    import autoTimeFormat from '$lib/helpers/autoTimeFormat.js';
    import { autoTicks } from '$lib/helpers/autoTicks.js';
    import { resolveScaledStyles } from '$lib/helpers/resolve.js';
    import { getPlotDefaults } from '$lib/hooks/plotDefaults.js';
    import { extent } from 'd3-array';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    interface AxisXMarkProps extends Omit<
        BaseMarkProps<Datum>,
        'fillOpacity' | 'paintOrder' | 'title' | 'href' | 'target'
    > {
        data?: Datum[];
        automatic?: boolean;
        title?: string | false | null;
        anchor?: 'top' | 'bottom';
        interval?: string | number;
        facetAnchor?: 'auto' | 'top-empty' | 'bottom-empty' | 'top' | 'bottom';
        labelAnchor?: 'auto' | 'left' | 'center' | 'right';
        tickSize?: number;
        tickFontSize?: ConstantAccessor<number, Datum>;
        titleFontSize?: number;
        tickPadding?: number;
        tickFormat?:
            | 'auto'
            | Intl.DateTimeFormatOptions
            | Intl.NumberFormatOptions
            | ((d: RawValue, i: number) => string);
        tickClass?: ConstantAccessor<string, Datum>;
        /** ticks is a shorthand for defining data, tickCount or interval */
        ticks?: number | string | Datum[];
        /** set to false or null to disable tick labels */
        text?: boolean | null;
        /** approximate number of ticks to be generated */
        tickCount?: number;
        /** approximate number of pixels between generated ticks */
        tickSpacing?: number;
        /** text anchor for axis labels */
        textAnchor?: ConstantAccessor<CSS.Property.TextAnchor | 'auto', Datum>;
        /**
         * you can set this to true to remove duplicate tick labels
         */
        removeDuplicateTicks?: boolean;
    }

    let markProps: AxisXMarkProps = $props();

    const DEFAULTS: Omit<AxisXMarkProps, 'data' | ChannelName> = {
        tickSize: 6,
        tickPadding: 3,
        tickFontSize: 11,
        titleFontSize: 11,
        textAnchor: 'auto',
        opacity: 0.8,
        anchor: 'bottom',
        ...getPlotDefaults().axis,
        ...getPlotDefaults().axisX
    };

    const { ticks: magicTicks } = $derived({ ...DEFAULTS, ...markProps });

    const {
        data,
        automatic = false,
        title,
        anchor,
        facetAnchor = 'auto',
        interval,
        tickSize,
        tickFontSize,
        tickPadding,
        labelAnchor,
        tickFormat,
        tickClass,
        class: className,
        tickCount,
        tickSpacing,
        text = true,
        ...options
    }: AxisXMarkProps = $derived({
        data: Array.isArray(magicTicks) ? magicTicks : [],
        tickCount: typeof magicTicks === 'number' ? magicTicks : undefined,
        interval: typeof magicTicks === 'string' ? magicTicks : undefined,
        ...DEFAULTS,
        ...markProps
    });

    const plot = usePlot();

    const autoTickCount = $derived(
        tickCount != null
            ? tickCount
            : tickSpacing != null
              ? Math.max(3, Math.round(plot.facetWidth / tickSpacing))
              : Math.max(3, Math.round(plot.facetWidth / plot.options.x.tickSpacing))
    );

    const ticks: RawValue[] = $derived(
        data.length > 0
            ? // use custom tick values if user passed any as prop
              Array.from(new Set(data))
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

    const useCompactNotation = $derived.by(() => {
        const range =
            extent(plot.scales.x.domain).filter(
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
                            // use compact notation if range covers multiple magnitudes
                            ...(useCompactNotation ? { notation: 'compact' } : {}),
                            ...DEFAULTS.numberFormat,
                            style: plot.options.x.percent ? 'percent' : 'decimal'
                        }).format(d)
    );

    const optionsLabel = $derived(plot.options?.x?.label);
    const scaleType = $derived(plot.scales.x.type);
    const isQuantitative = $derived(scaleType !== 'point' && scaleType !== 'band');

    const useTitle = $derived(
        title !== undefined
            ? title || ''
            : optionsLabel === null
              ? null
              : optionsLabel !== undefined
                ? optionsLabel
                : plot.scales.x.autoTitle
                  ? isQuantitative
                      ? plot.options.x?.reverse
                          ? `← ${plot.scales.x.autoTitle}${plot.options.x.percent ? ' (%)' : ''}`
                          : `${plot.scales.x.autoTitle}${plot.options.x.percent ? ' (%)' : ''} →`
                      : plot.scales.x.autoTitle
                  : ''
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
                    opacity: 0.8,
                    ...options,
                    stroke: null,
                    fontSize: options.titleFontSize || 11,
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
            y={anchor === 'top'
                ? (options.titleFontSize || 11) + 5
                : plot.height - (options.titleFontSize || 11) - 5}
            class="axis-x-title"
            dominant-baseline={anchor === 'top' ? 'auto' : 'hanging'}>{useTitle}</text>
    {/if}
    {#if showAxis}
        <BaseAxisX
            {anchor}
            {className}
            {labelAnchor}
            options={{ ...options, ...plot.options.x }}
            {plot}
            {text}
            {tickClass}
            {tickFontSize}
            {tickPadding}
            {ticks}
            {tickSize}
            height={plot.facetHeight}
            marginTop={plot.options.marginTop}
            scaleFn={plot.scales.x.fn}
            scaleType={plot.scales.x.type}
            tickFormat={useTickFormat}
            title={useTitle} />
    {/if}
</Mark>

<style>
    text {
        fill: currentColor;
    }
</style>
