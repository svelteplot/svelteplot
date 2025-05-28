<!--
    @component
    For arbitrary rectangles, requires quantitative x and y scales 
-->
<script module lang="ts">
    export type RectMarkProps = {
        data: DataRecord[];
        x?: ChannelAccessor;
        x1?: ChannelAccessor;
        x2?: ChannelAccessor;
        y?: ChannelAccessor;
        y1?: ChannelAccessor;
        y2?: ChannelAccessor;
        interval?: number | string;
    } & BaseMarkProps &
        BaseRectMarkProps;
</script>

<script lang="ts">
    import Mark from '../Mark.svelte';
    import { getContext } from 'svelte';
    import { intervalX, intervalY } from '$lib/index.js';
    import type {
        PlotContext,
        DataRecord,
        BaseMarkProps,
        BaseRectMarkProps,
        ChannelAccessor
    } from '../types.js';
    import GroupMultiple from './helpers/GroupMultiple.svelte';
    import RectPath from './helpers/RectPath.svelte';

    let { data = [{}], class: className = 'rect', ...options }: RectMarkProps = $props();

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    let plot = $derived(getPlotState());

    const args = $derived(
        intervalY(intervalX({ data, ...options }, { plot }), { plot }) as RectMarkProps
    );
</script>

<Mark
    type="rect"
    required={[]}
    channels={['x1', 'x2', 'y1', 'y2', 'fill', 'stroke', 'opacity', 'fillOpacity', 'strokeOpacity']}
    {...args}>
    {#snippet children({ usedScales, scaledData })}
        <GroupMultiple class={scaledData.length > 1 ? className : null} length={scaledData.length}>
            {#each scaledData as d, i (i)}
                {#if d.valid}
                    {@const x1 = d.x1 == null ? plot.options.marginLeft : d.x1}
                    {@const x2 = d.x2 == null ? plot.options.marginLeft + plot.facetWidth : d.x2}
                    {@const y1 = d.y1 == null ? plot.options.marginTop : d.y1}
                    {@const y2 = d.y2 == null ? plot.options.marginTop + plot.facetHeight : d.y2}

                    {@const miny = Math.min(y1, y2)}
                    {@const maxy = Math.max(y1, y2)}
                    {@const minx = Math.min(x1, x2)}
                    {@const maxx = Math.max(x1, x2)}

                    <RectPath
                        datum={d}
                        class={scaledData.length === 1 ? className : null}
                        x={minx}
                        y={miny}
                        width={maxx - minx}
                        height={maxy - miny}
                        options={args}
                        {usedScales} />
                {/if}
            {/each}
        </GroupMultiple>
    {/snippet}
</Mark>

<style>
    rect {
        stroke: none;
        /* fill: none; */
    }
</style>
