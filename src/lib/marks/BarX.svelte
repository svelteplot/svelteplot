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
         * Renders using Canvas instead of SVG.
         */

        canvas?: boolean;
        /**
         * Converts x into x1/x2 ranges based on the provided interval. Disables the
         * implicit stacking
         */
        interval?: number | string;
    }

    import Mark from '../Mark.svelte';
    import { stackX, recordizeX, intervalX, sort } from '../index.js';

    import type { StackOptions } from '../transforms/stack.js';
    import type { DataRow } from 'svelteplot/types/index.js';
    import GroupMultiple from './helpers/GroupMultiple.svelte';
    import RectPath from './helpers/RectPath.svelte';
    import RectCanvas from './helpers/RectCanvas.svelte';
    import type {
        BaseMarkProps,
        BaseRectMarkProps,
        ChannelAccessor,
        DataRecord,
        LinkableMarkProps
    } from '../types/index.js';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    const DEFAULTS = {
        fill: 'currentColor',
        ...getPlotDefaults().bar,
        ...getPlotDefaults().barX
    };

    let markProps: BarXMarkProps = $props();

    const {
        data = [{} as Datum],
        class: className = '',
        stack,
        canvas = false,
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
    {#snippet children({ usedScales, scaledData })}
        {@const bw = plot.scales.y.fn.bandwidth()}
        {@const barGroupClass = className ? `bar-x ${className}` : 'bar-x'}
        {#if canvas}
            {@const rectCanvasData = scaledData
                .filter((d) => d.valid)
                .map((d) => {
                    const minx = Math.min(d.x1 as number, d.x2 as number);
                    const maxx = Math.max(d.x1 as number, d.x2 as number);

                    return {
                        ...d,
                        x1: minx,
                        x2: maxx,
                        y1: (d.y as number) - bw * 0.5,
                        y2: (d.y as number) + bw * 0.5
                    };
                })}
            <GroupMultiple class={barGroupClass} length={scaledData.length}>
                <RectCanvas
                    options={options as BaseMarkProps<DataRecord> & BaseRectMarkProps<DataRecord>}
                    data={rectCanvasData}
                    {usedScales}
                    useInsetAsFallbackHorizontally={false} />
            </GroupMultiple>
        {:else}
            <GroupMultiple class="bar-x" length={scaledData.length}>
                {#each scaledData as d, i (i)}
                    {@const minx = Math.min(d.x1 as number, d.x2 as number)}
                    {@const maxx = Math.max(d.x1 as number, d.x2 as number)}
                    {#if d.valid}
                        <RectPath
                            {usedScales}
                            class={className}
                            options={options as BaseRectMarkProps<DataRecord> & BaseMarkProps<DataRecord>}
                            datum={d}
                            x={minx}
                            useInsetAsFallbackHorizontally={false}
                            y={(d.y as number) - bw * 0.5}
                            width={maxx - minx}
                            height={bw} />
                    {/if}
                {/each}
            </GroupMultiple>
        {/if}
    {/snippet}
</Mark>
