<!-- 
    @component 
    The TickY mark is useful for showing one-dimensional distributions along the y axis. The x axis must be a band scale.
-->
<script module lang="ts">
    export type TickYMarkProps = Omit<BaseMarkProps, 'fill' | 'fillOpacity'> & {
        data: DataRow[];
        /**
         * the vertical position; bound to the x scale
         */
        y?: ChannelAccessor;
        /**
         * the horizontal position; bound to the x scale, which must be band. If the x channel
         * is not specified, the tick will span the full horizontal extent of the frame.
         */
        x?: ChannelAccessor;
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
        FacetContext,
        ConstantAccessor
    } from '../types.js';
    import { recordizeY } from '$lib/index.js';
    import { projectX, projectY } from '../helpers/scales.js';
    import { isValid } from '../helpers/isValid.js';
    import { testFilter, parseInset } from '$lib/helpers/index.js';

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    let plot = $derived(getPlotState());

    let { data = [{}], ...options }: TickYMarkProps = $props();

    let args = $derived(recordizeY({ data, ...options }, { withIndex: false }));

    const { getTestFacet } = getContext<FacetContext>('svelteplot/facet');
    let testFacet = $derived(getTestFacet());
</script>

<Mark type="tickY" channels={['x', 'y', 'stroke', 'opacity', 'strokeOpacity']} {...args}>
    {#snippet children({ mark, usedScales })}
        <g class="tick-y">
            {#each args.data as datum, i (i)}
                {#if testFacet(datum, mark.options) && testFilter(datum, args)}
                    {@const y_ = resolveChannel('y', datum, args)}
                    {@const x_ = resolveChannel('x', datum, args)}
                    {@const inset_ = resolveProp(args.inset, datum, 0)}
                    {@const tickLength_ = resolveProp(args.tickLength, datum, 10)}
                    {@const dx_ = resolveProp(args.dx, datum, 0)}
                    {@const dy_ = resolveProp(args.dy, datum, 0)}
                    {#if isValid(y_) && (isValid(x_) || args.x == null)}
                        {@const y = usedScales.y ? projectY('y', plot.scales, y_) : y_}
                        {@const x1 =
                            args.x != null
                                ? usedScales.x
                                    ? projectX('x1', plot.scales, x_)
                                    : x_
                                : plot.options.marginLeft}
                        {@const x2 =
                            args.x != null
                                ? usedScales.x
                                    ? projectX('x2', plot.scales, x_)
                                    : x_
                                : plot.options.marginLeft + plot.facetWidth}
                        {@const inset = parseInset(inset_, Math.abs(x2 - x1))}
                        <line
                            transform="translate({dx_}, {y + dy_})"
                            style={resolveScaledStyles(datum, args, usedScales, plot, 'stroke')}
                            x1={x1 + inset + (x1 === x2 ? tickLength_ * 0.5 : 0)}
                            x2={x2 - inset - (x1 === x2 ? tickLength_ * 0.5 : 0)} />
                    {/if}
                {/if}
            {/each}
        </g>
    {/snippet}
</Mark>

<style>
    .tick-y line {
        stroke: currentColor;
    }
</style>
