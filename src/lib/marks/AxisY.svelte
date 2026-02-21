<!-- @component
    Renders a vertical axis with labels and tick marks
-->
<script lang="ts" generics="Datum extends RawValue">
    import { getContext } from 'svelte';
    import BaseAxisY from './helpers/BaseAxisY.svelte';
    import Mark from '../Mark.svelte';
    import type {
        BaseMarkProps,
        RawValue,
        FacetContext,
        ChannelName,
        ConstantAccessor,
        TickFormatFunction,
        DataRecord,
        ScaledChannelName
    } from '../types/index.js';
    import autoTimeFormat from '../helpers/autoTimeFormat.js';
    import { autoTicks } from '../helpers/autoTicks.js';
    import { resolveScaledStyles } from '../helpers/resolve.js';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';
    import { extent } from 'd3-array';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    interface AxisYMarkProps extends Omit<
        BaseMarkProps<Datum>,
        'fillOpacity' | 'paintOrder' | 'title' | 'href' | 'target' | 'textAnchor'
    > {
        /** custom tick values to display on the axis */
        data?: Datum[];
        /** whether this axis was automatically added by the Plot component */
        automatic?: boolean;
        /** the axis title label; set to false or null to hide */
        title?: string | false | null;
        /** which edge of the plot the axis appears on */
        anchor?: 'left' | 'right';
        /** controls which facet edge displays this axis */
        facetAnchor?: 'auto' | 'left' | 'right' | 'left-empty' | 'right-empty';
        /** vertical alignment of tick labels relative to the tick position */
        lineAnchor?: 'top' | 'center' | 'bottom';
        /** the interval between ticks, e.g. "day", "month", or a number */
        interval?: string | number;
        /** horizontal alignment of the axis title */
        labelAnchor?: 'auto' | 'left' | 'center' | 'right';
        /** text anchor for tick labels */
        textAnchor?: 'auto' | 'start' | 'middle' | 'end';
        /** the length of tick marks in pixels */
        tickSize?: number;
        /** font size for tick labels */
        tickFontSize?: ConstantAccessor<number, Datum>;
        /** font size for the axis title */
        titleFontSize?: number;
        /** spacing between tick marks and tick labels in pixels */
        tickPadding?: number;
        /** formatter for tick labels; can be "auto", an Intl format options object, or a custom function */
        tickFormat?:
            | 'auto'
            | Intl.DateTimeFormatOptions
            | Intl.NumberFormatOptions
            | ((d: RawValue) => string);
        /** CSS class applied to each tick label */
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

    const DEFAULTS = {
        tickSize: 6,
        tickPadding: 3,
        tickFontSize: 11,
        opacity: 0.8,
        anchor: 'left',
        textAnchor: 'auto',
        ...getPlotDefaults().axis,
        ...getPlotDefaults().axisY
    };

    const { ticks: magicTicks } = $derived({ ...DEFAULTS, ...markProps });

    const {
        data = [] as Datum[],
        automatic = false,
        title,
        anchor = 'left',
        class: className,
        facetAnchor = 'auto',
        interval,
        lineAnchor = 'center',
        textAnchor,
        tickSize,
        tickFontSize,
        tickPadding,
        tickFormat,
        tickClass,
        tickCount,
        tickSpacing,
        text = true,
        ...options
    }: AxisYMarkProps = $derived({
        data: (Array.isArray(magicTicks) ? magicTicks : []) as Datum[],
        tickCount: typeof magicTicks === 'number' ? magicTicks : undefined,
        interval: typeof magicTicks === 'string' ? magicTicks : undefined,
        ...DEFAULTS,
        ...markProps
    } as AxisYMarkProps);

    const plot = usePlot();

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
        const numericDomain = plot.scales.y.domain.filter(
            (d): d is number => typeof d === 'number' && Number.isFinite(d)
        );
        if (numericDomain.length < 2) return false;
        const [min, max] = extent(numericDomain) as [number, number];
        const crossesZero = min <= 0 && max >= 0;
        if (crossesZero) return true;
        const magnitudes = [min, max].map((d) =>
            d === 0 ? -Infinity : Math.floor(Math.log10(Math.abs(d)))
        );
        return magnitudes[0] !== magnitudes[1];
    });

    const tickFmt = $derived(tickFormat || plot.options.y.tickFormat);

    const useTickFormat = $derived(
        typeof tickFmt === 'function'
            ? tickFmt
            : plot.scales.y.type === 'band' || plot.scales.y.type === 'point'
              ? (d: RawValue) => String(d)
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
                            ...getPlotDefaults().numberFormat,
                            style: plot.options.y.percent ? 'percent' : 'decimal'
                        }).format(d as number)
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
                  ? `${!plot.options.y.reverse ? '↑' : '↓'} ${plot.scales.y.autoTitle}${plot.options.y.percent ? ' (%)' : ''}`
                  : ''
    );

    const { getFacetState } = getContext<FacetContext>('svelteplot/facet');
    const { left, leftEmpty, right, rightEmpty, top } = $derived(getFacetState());

    const useFacetAnchor = $derived(
        facetAnchor !== 'auto' ? facetAnchor : anchor === 'left' ? 'left-empty' : 'right-empty'
    );

    const showAxis = $derived(
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
    {...{ ...options, y: '__y' } as any}
    {automatic}>
    {#if left && top && useTitle}
        <text
            style={resolveScaledStyles(
                {} as DataRecord,
                {
                    opacity: 0.8,
                    ...options,
                    fontSize: options.titleFontSize ?? 11,
                    fill: 'currentColor',
                    stroke: null,
                    textAnchor: anchor === 'left' ? 'start' : 'end'
                },
                {} as Record<ScaledChannelName, boolean>,
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
            class={className}
            {lineAnchor}
            options={{
                ...(options as any),
                textAnchor:
                    textAnchor == null || textAnchor === 'auto'
                        ? anchor === 'left'
                            ? 'end'
                            : 'start'
                        : textAnchor
            }}
            {plot}
            {text}
            tickClass={tickClass as ConstantAccessor<string>}
            tickFontSize={tickFontSize as ConstantAccessor<number>}
            {tickPadding}
            {ticks}
            {tickSize}
            marginLeft={plot.options.marginLeft}
            scaleFn={plot.scales.y.fn}
            scaleType={plot.scales.y.type}
            tickFormat={useTickFormat as TickFormatFunction}
            title={useTitle as string | null}
            width={plot.facetWidth} />
    {/if}
</Mark>

<style>
    text {
        fill: currentColor;
    }
</style>
