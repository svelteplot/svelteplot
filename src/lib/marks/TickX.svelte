<!-- 
    @component 
    The TickX mark is useful for showing one-dimensional distributions along the x axis. The y axis must be a band scale.
-->
<script module lang="ts">
    export type TickXMarkProps = Omit<BaseMarkProps, 'fill' | 'fillOpacity'> & {
        data: DataRow[];
        /**
         * the horizontal position; bound to the x scale
         */
        x?: ChannelAccessor;
        /**
         * the vertical position; bound to the y scale, which must be band. If the y channel
         * is not specified, the tick will span the full vertical extent of the frame.
         */
        y?: ChannelAccessor;
        /**
         * if ticks are used on a non-bandwidth scale, this will determine the
         * length of the tick. Defaults to 10 pixel
         */
        tickLength?: ConstantAccessor<number>;
    };
</script>

<script lang="ts">
    import Mark from '../Mark.svelte';
    import { getContext } from 'svelte';
    import { resolveChannel, resolveProp, resolveScaledStyles } from '../helpers/resolve.js';
    import type {
        PlotContext,
        BaseMarkProps,
        ChannelAccessor,
        DataRow,
        FacetContext
    } from '../types.js';
    import { recordizeX } from '$lib/index.js';
    import { projectX, projectY } from '../helpers/scales.js';
    import { isValid } from '../helpers/isValid.js';
    import { testFilter, parseInset } from '$lib/helpers/index.js';

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    let plot = $derived(getPlotState());

    let { data = [{}], ...options }: TickXMarkProps = $props();

    let args = $derived(recordizeX({ data, ...options }, { withIndex: false }));

    const { getTestFacet } = getContext<FacetContext>('svelteplot/facet');
    let testFacet = $derived(getTestFacet());
</script>

<Mark type="tickX" channels={['x', 'y', 'stroke', 'opacity', 'strokeOpacity']} {...args}>
    {#snippet children({ mark, usedScales })}
        <g class="tick-x">
            {#each args.data as datum, i (i)}
                {#if testFacet(datum, mark.options) && testFilter(datum, args)}
                    {@const x_ = resolveChannel('x', datum, args)}
                    {@const y_ = resolveChannel('y', datum, args)}
                    {@const inset_ = resolveProp(args.inset, datum, 0)}
                    {@const tickLength_ = resolveProp(args.tickLength, datum, 10)}
                    {@const dx_ = resolveProp(args.dx, datum, 0)}
                    {@const dy_ = resolveProp(args.dy, datum, 0)}
                    {#if isValid(x_) && (isValid(y_) || args.y == null) && (args.filter == null || resolveProp(args.filter, datum))}
                        {@const x = usedScales.x ? projectX('x', plot.scales, x_) : x_}
                        {@const y1 =
                            args.y != null
                                ? usedScales.y
                                    ? projectY('y1', plot.scales, y_)
                                    : y_
                                : plot.options.marginTop}
                        {@const y2 =
                            args.y != null
                                ? usedScales.y
                                    ? Number(projectY('y2', plot.scales, y_))
                                    : y_
                                : plot.options.marginTop + plot.plotHeight}
                        {@const inset = parseInset(inset_, Math.abs(y2 - y1))}
                        <line
                            transform="translate({x + dx_}, {dy_})"
                            style={resolveScaledStyles(datum, args, usedScales, plot, 'stroke')}
                            y1={y1 + inset + (y1 === y2 ? tickLength_ * 0.5 : 0)}
                            y2={y2 - inset - (y1 === y2 ? tickLength_ * 0.5 : 0)} />
                    {/if}
                {/if}
            {/each}
        </g>
    {/snippet}
</Mark>

<style>
    .tick-x line {
        stroke: currentColor;
    }
</style>
