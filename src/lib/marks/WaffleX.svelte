<!--
    @component
    The waffleX mark lets you create waffle charts by filling a rectangular area with small squares representing data values.
-->
<script lang="ts" generics="Datum extends DataRecord">
    import type {
        DataRecord,
        BaseMarkProps,
        ChannelAccessor,
        LinkableMarkProps
    } from 'svelteplot/types';
    import { wafflePolygon, type WaffleOptions } from './helpers/waffle';
    import { getPlotDefaults } from 'svelteplot/hooks/plotDefaults';
    import { intervalX, recordizeX, sort, stackX } from 'svelteplot/transforms';
    import type { StackOptions } from 'svelteplot/transforms/stack';
    import Mark from '$lib/Mark.svelte';
    import { getContext } from 'svelte';

    interface WaffleXMarkProps
        extends BaseMarkProps<Datum>,
            LinkableMarkProps<Datum>,
            WaffleOptions {
        data?: Datum[];
        /**
         * bound to a quantitative scale
         */
        x?: ChannelAccessor<Datum>;
        /**
         * bound to a quantitative scale
         */
        x1?: ChannelAccessor<Datum>;
        /**
         * bound to a quantitative scale
         */
        x2?: ChannelAccessor<Datum>;
        /**
         * bound to a band scale
         */
        y?: ChannelAccessor<Datum>;
        stack?: StackOptions;
    }

    const DEFAULTS = {
        fill: 'currentColor',
        ...getPlotDefaults().waffle,
        ...getPlotDefaults().waffleX
    };

    let markProps: WaffleXMarkProps = $props();

    const {
        data = [{} as Datum],
        class: className = null,
        stack,
        unit,
        ...options
    }: WaffleXMarkProps = $derived({ ...DEFAULTS, ...markProps });

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    const args = $derived(
        stackX(
            intervalX(
                // by default, sort by y channel (the ordinal labels)
                sort(recordizeX({ data, ...options })),
                { plot }
            ),
            stack
        )
    );
</script>

<Mark
    type="waffleX"
    requiredScales={{ y: ['band'] }}
    channels={['x1', 'x2', 'y', 'fill', 'stroke', 'opacity', 'fillOpacity', 'strokeOpacity']}
    {...args}>
    {#snippet children({ mark, usedScales, scaledData })}
        {@const wafflePoly = wafflePolygon('x', args, plot.scales)}
        {#each scaledData as d, i (i)}
            {@const { pattern, rect, path } = wafflePoly(d)}
            <g>
                <pattern {...pattern}>
                    <rect {...rect} fill="currentColor" />
                </pattern>
                <path {...path} />
            </g>
        {/each}
    {/snippet}
</Mark>
