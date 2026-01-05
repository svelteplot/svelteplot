<!--
    @component
    For horizontal bar charts using a band scale as y axis
-->
<script lang="ts" generics="Datum extends DataRow">
    interface BarXMarkProps
        extends BaseMarkProps<Datum>, LinkableMarkProps<Datum>, BaseRectMarkProps<Datum> {
        data: Datum[];
        x?: ChannelAccessor<Datum>;
        x1?: ChannelAccessor<Datum>;
        x2?: ChannelAccessor<Datum>;
        y?: ChannelAccessor<Datum>;
        stack?: StackOptions;
        /**
         * Converts x into x1/x2 ranges based on the provided interval. Disables the
         * implicit stacking
         */
        interval?: number | string;
    }

    import Mark from '../Mark.svelte';
    import { stackX, recordizeX, intervalX, sort } from '$lib/index.js';

    import type { StackOptions } from '$lib/transforms/stack.js';
    import type { DataRow } from 'svelteplot/types/index.js';
    import GroupMultiple from './helpers/GroupMultiple.svelte';
    import RectPath from './helpers/RectPath.svelte';
    import type {
        BaseMarkProps,
        BaseRectMarkProps,
        ChannelAccessor,
        LinkableMarkProps
    } from '../types/index.js';
    import { getPlotDefaults } from '$lib/hooks/plotDefaults.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    const DEFAULTS = {
        fill: 'currentColor',
        ...getPlotDefaults().bar,
        ...getPlotDefaults().barX
    };

    let markProps: BarXMarkProps = $props();

    const {
        data = [{} as Datum],
        class: className = null,
        stack,
        ...options
    }: BarXMarkProps = $derived({ ...DEFAULTS, ...markProps });

    const plot = usePlot();

    const args = $derived(
        stackX(
            intervalX(
                // by default, sort by y channel (the ordinal labels)
                sort(recordizeX({ data, ...options }))
            ),
            stack
        )
    );
</script>

<Mark
    type="barX"
    requiredScales={{ y: ['band'] }}
    channels={['x1', 'x2', 'y', 'fill', 'stroke', 'opacity', 'fillOpacity', 'strokeOpacity']}
    {...args}>
    {#snippet children({ mark, usedScales, scaledData })}
        <GroupMultiple class="bar-x" length={scaledData.length}>
            {#each scaledData as d, i (i)}
                {@const bw = plot.scales.y.fn.bandwidth()}
                {@const minx = Math.min(d.x1, d.x2)}
                {@const maxx = Math.max(d.x1, d.x2)}
                {#if d.valid}
                    <RectPath
                        {usedScales}
                        class={className}
                        {options}
                        datum={d}
                        x={minx}
                        useInsetAsFallbackHorizontally={false}
                        y={d.y - bw * 0.5}
                        width={maxx - minx}
                        height={bw} />
                {/if}
            {/each}
        </GroupMultiple>
    {/snippet}
</Mark>
