<!--
    @component
    For vertical column charts using a band scale as x axis
-->

<script lang="ts" generics="Datum extends DataRow">
    interface BarYMarkProps
        extends BaseMarkProps<Datum>,
            LinkableMarkProps<Datum>,
            BaseRectMarkProps<Datum> {
        data: Datum[];
        x?: ChannelAccessor<Datum>;
        y?: ChannelAccessor<Datum>;
        y1?: ChannelAccessor<Datum>;
        y2?: ChannelAccessor<Datum>;
        stack?: StackOptions;
        /**
         * Converts y into y1/y2 ranges based on the provided interval. Disables the
         * implicit stacking
         */
        interval?: number | string;
    }

    import Mark from '../Mark.svelte';
    import { getContext } from 'svelte';
    import { intervalY, stackY, recordizeY, sort } from '$lib/index.js';

    import type { StackOptions } from '$lib/transforms/stack.js';
    import GroupMultiple from './helpers/GroupMultiple.svelte';
    import RectPath from './helpers/RectPath.svelte';
    import type {
        PlotContext,
        BaseMarkProps,
        BaseRectMarkProps,
        ChannelAccessor,
        DataRow,
        PlotDefaults,
        LinkableMarkProps
    } from '../types.js';

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    const DEFAULTS = {
        fill: 'currentColor',
        ...getContext<PlotDefaults>('svelteplot/_defaults').bar,
        ...getContext<PlotDefaults>('svelteplot/_defaults').barY
    };

    let markProps: BarYMarkProps = $props();

    const {
        data = [{}],
        class: className = null,
        stack,
        ...options
    }: BarYMarkProps = $derived({ ...DEFAULTS, ...markProps });

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
