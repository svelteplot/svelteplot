<!-- 
    @component 
    The TickY mark is useful for showing one-dimensional distributions along the y axis. The x axis must be a band scale.
-->
<script lang="ts" generics="Datum extends DataRow">
    interface TickYMarkProps extends Omit<BaseMarkProps<Datum>, 'fill' | 'fillOpacity'> {
        data: Datum[];
        /**
         * the vertical position; bound to the x scale
         */
        y?: ChannelAccessor<Datum>;
        /**
         * the horizontal position; bound to the y scale, which must be band. If the y channel
         * is not specified, the tick will span the full vertical extent of the frame.
         */
        x?: ChannelAccessor<Datum>;
        /**
         * if ticks are used on a non-bandwidth scale, this will determine the
         * length of the tick. Defaults to 10 pixel
         */
        tickLength?: ConstantAccessor<number, Datum>;
    }
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
    } from '../types/index.js';
    import { recordizeY } from '$lib/index.js';
    import { projectX, projectY } from '../helpers/scales.js';
    import { isValid } from '../helpers/index.js';
    import { testFilter, parseInset } from '$lib/helpers/index.js';
    import { getPlotDefaults } from '$lib/hooks/plotDefaults.js';

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    let plot = $derived(getPlotState());

    let markProps: TickYMarkProps = $props();
    const DEFAULTS = {
        ...getPlotDefaults().tick,
        ...getPlotDefaults().tickY
    };
    const {
        data = [{}],
        class: className = '',
        ...options
    }: TickYMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    let args = $derived(recordizeY({ data, ...options }, { withIndex: false }));

    const { getTestFacet } = getContext<FacetContext>('svelteplot/facet');
    let testFacet = $derived(getTestFacet());
</script>

<Mark
    type="tickY"
    channels={['x', 'y', 'stroke', 'opacity', 'strokeOpacity']}
    {...markProps}
    {...args}>
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
