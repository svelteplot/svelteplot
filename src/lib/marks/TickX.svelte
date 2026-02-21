<!-- 
    @component 
    The TickX mark is useful for showing one-dimensional distributions along the x axis. The y axis must be a band scale.
-->

<script lang="ts" generics="Datum = DataRecord | RawValue">
    interface TickXMarkProps extends Omit<BaseMarkProps<Datum>, 'fill' | 'fillOpacity'> {
        /** the input data array; each element becomes one vertical tick */
        data: Datum[];
        /**
         * the horizontal position; bound to the x scale
         */
        x?: ChannelAccessor<Datum>;
        /**
         * the vertical position; bound to the y scale, which must be band. If the y channel
         * is not specified, the tick will span the full vertical extent of the frame.
         */
        y?: ChannelAccessor<Datum>;
        /**
         * if ticks are used on a non-bandwidth scale, this will determine the
         * length of the tick. Defaults to 10 pixel
         */
        tickLength?: ConstantAccessor<number, Datum>;
        /** if true, renders using Canvas instead of SVG */
        canvas?: boolean;
    }
    import Mark from '../Mark.svelte';
    import TickCanvas from './helpers/TickCanvas.svelte';
    import { resolveProp, resolveScaledStyles } from '../helpers/resolve.js';
    import type {
        BaseMarkProps,
        ChannelAccessor,
        ConstantAccessor,
        DataRecord,
        RawValue
    } from '../types/index.js';
    import { recordizeX } from '../index.js';
    import { parseInset } from '../helpers/index.js';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    const plot = usePlot();

    let markProps: TickXMarkProps = $props();
    const DEFAULTS = {
        ...getPlotDefaults().tick,
        ...getPlotDefaults().tickX
    };
    const {
        data = [{} as Datum],
        class: className = '',
        canvas = false,
        ...options
    }: TickXMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    let args = $derived(recordizeX({ data, ...options } as any, { withIndex: false }));
</script>

<Mark
    type="tickX"
    channels={['x', 'y', 'stroke', 'opacity', 'strokeOpacity']}
    {...markProps as any}
    {...args as any}>
    {#snippet children({ usedScales, scaledData })}
        {#if canvas}
            <TickCanvas
                data={scaledData}
                options={args as any}
                {usedScales}
                orientation="vertical" />
        {:else}
            {@const yUsesBand = usedScales.y && plot.scales.y.type === 'band'}
            {@const yBandwidth = yUsesBand ? plot.scales.y.fn.bandwidth() : 0}
            <g class="tick-x {className || ''}">
                {#each scaledData as d, i (i)}
                    {#if d.valid && d.x != null}
                        {@const inset_ = resolveProp(args.inset, d.datum, 0)}
                        {@const tickLength_ = Number(
                            resolveProp(args.tickLength, d.datum, 10) ?? 10
                        )}
                        {@const y1 =
                            args.y != null && d.y != null
                                ? yUsesBand
                                    ? d.y - yBandwidth * 0.5
                                    : d.y
                                : plot.options.marginTop}
                        {@const y2 =
                            args.y != null && d.y != null
                                ? yUsesBand
                                    ? d.y + yBandwidth * 0.5
                                    : d.y
                                : plot.options.marginTop + plot.plotHeight}
                        {@const insetValue =
                            typeof inset_ === 'number' || typeof inset_ === 'string' ? inset_ : 0}
                        {@const inset = parseInset(insetValue, Math.abs(y2 - y1))}
                        {@const tickOffset = y1 === y2 ? tickLength_ * 0.5 : 0}
                        {@const xTransform = d.x}
                        {@const yTransform = args.y == null ? d.dy : 0}
                        <line
                            transform="translate({xTransform}, {yTransform})"
                            style={resolveScaledStyles(
                                d.datum,
                                args as any,
                                usedScales,
                                plot,
                                'stroke'
                            )}
                            y1={y1 + inset + tickOffset}
                            y2={y2 - inset - tickOffset} />
                    {/if}
                {/each}
            </g>
        {/if}
    {/snippet}
</Mark>

<style>
    .tick-x line {
        stroke: currentColor;
    }
</style>
