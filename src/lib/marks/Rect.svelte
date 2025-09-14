<!--
    @component
    For arbitrary rectangles, requires quantitative x and y scales 
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface RectMarkProps
        extends BaseMarkProps<Datum>,
            LinkableMarkProps<Datum>,
            BaseRectMarkProps<Datum> {
        data: Datum[];
        x?: ChannelAccessor<Datum>;
        x1?: ChannelAccessor<Datum>;
        x2?: ChannelAccessor<Datum>;
        y?: ChannelAccessor<Datum>;
        y1?: ChannelAccessor<Datum>;
        y2?: ChannelAccessor<Datum>;
        interval?: number | string;
        className?: string;
    }
    import Mark from '../Mark.svelte';
    import { getContext } from 'svelte';
    import { intervalX, intervalY } from '$lib/index.js';
    import type {
        PlotContext,
        DataRecord,
        BaseMarkProps,
        BaseRectMarkProps,
        ChannelAccessor,
        PlotDefaults,
        LinkableMarkProps
    } from '../types/index.js';
    import GroupMultiple from './helpers/GroupMultiple.svelte';
    import RectPath from './helpers/RectPath.svelte';
    import { resolveProp } from 'svelteplot/helpers/resolve';

    let markProps: RectMarkProps = $props();

    const DEFAULTS = {
        ...getContext<PlotDefaults>('svelteplot/_defaults').rect
    };

    const {
        data = [{} as Datum],
        class: className = '',
        ...options
    }: RectMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

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
                    {@const x1 = d.x1 == null ? plot.options.marginLeft + d.dx : d.x1}
                    {@const x2 =
                        d.x2 == null ? plot.options.marginLeft + plot.facetWidth + d.dx : d.x2}
                    {@const y1 = d.y1 == null ? plot.options.marginTop + d.dy : d.y1}
                    {@const y2 =
                        d.y2 == null ? plot.options.marginTop + plot.facetHeight + d.dy : d.y2}

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
