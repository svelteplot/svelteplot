<!--
    @component
    For vertical column charts using a band scale as x axis
-->
<script module lang="ts">
    import type {
        PlotContext,
        BaseMarkProps,
        BaseRectMarkProps,
        ChannelAccessor,
        DataRow
    } from '../types.js';

    export type BarYMarkProps = BaseMarkProps &
        BaseRectMarkProps & {
            data: DataRow[];
            x?: ChannelAccessor;
            y?: ChannelAccessor;
            y1?: ChannelAccessor;
            y2?: ChannelAccessor;
            stack?: StackOptions;
            /**
             * Converts y into y1/y2 ranges based on the provided interval. Disables the
             * implicit stacking
             */
            interval?: number | string;
        };
</script>

<script lang="ts">
    import Mark from '../Mark.svelte';
    import { getContext } from 'svelte';
    import { intervalY, stackY, recordizeY, sort } from '$lib/index.js';

    import type { StackOptions } from '$lib/transforms/stack.js';
    import GroupMultiple from './helpers/GroupMultiple.svelte';
    import RectPath from './helpers/RectPath.svelte';

    let { data = [{}], class: className = null, stack, ...options }: BarYMarkProps = $props();

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    const args = $derived(
        stackY(
            intervalY(
                // by default, sort by x channel (the ordinal labels)
                sort(recordizeY({ data, sort: { channel: 'x' }, ...options })),
                { plot }
            ),
            stack
        )
    );
</script>

<Mark
    type="barY"
    requiredScales={{ x: ['band'] }}
    channels={['x', 'y1', 'y2', 'fill', 'stroke', 'opacity', 'fillOpacity', 'strokeOpacity']}
    {...args}>
    {#snippet children({ scaledData, usedScales })}
        <GroupMultiple class="bar-y" length={scaledData.length}>
            {#each scaledData as d, i (i)}
                {@const bw = plot.scales.x.fn.bandwidth()}
                {@const miny = Math.min(d.y1, d.y2)}
                {@const maxy = Math.max(d.y1, d.y2)}
                {#if d.valid}
                    <RectPath
                        x={d.x - bw * 0.5}
                        y={miny}
                        options={args}
                        class={className}
                        width={bw}
                        height={maxy - miny}
                        datum={d}
                        {usedScales}
                        useInsetAsFallbackVertically={false} />
                {/if}
            {/each}
        </GroupMultiple>
    {/snippet}
</Mark>
