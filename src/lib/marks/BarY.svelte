<!--
    @component
    For vertical column charts using a band scale as x axis
-->

<script lang="ts" generics="Datum extends DataRow">
    interface BarYMarkProps
        extends BaseMarkProps<Datum>, LinkableMarkProps<Datum>, BaseRectMarkProps<Datum> {
        data: Datum[];
        x?: ChannelAccessor<Datum>;
        y?: ChannelAccessor<Datum>;
        y1?: ChannelAccessor<Datum>;
        y2?: ChannelAccessor<Datum>;
        stack?: StackOptions;
        /**
         * Renders using Canvas instead of SVG.
         */
        canvas?: boolean;
        /**
         * Converts y into y1/y2 ranges based on the provided interval. Disables the
         * implicit stacking
         */
        interval?: number | string;
    }

    import Mark from '../Mark.svelte';
    import { intervalY, stackY, recordizeY, sort } from '../index.js';

    import type { StackOptions } from '../transforms/stack.js';
    import GroupMultiple from './helpers/GroupMultiple.svelte';
    import RectPath from './helpers/RectPath.svelte';
    import RectCanvas from './helpers/RectCanvas.svelte';
    import type {
        BaseMarkProps,
        BaseRectMarkProps,
        ChannelAccessor,
        DataRow,
        LinkableMarkProps
    } from '../types/index.js';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    const plot = usePlot();

    const DEFAULTS = {
        ...getPlotDefaults().bar,
        ...getPlotDefaults().barY
    };

    let markProps: BarYMarkProps = $props();

    const {
        data = [{}],
        class: className = null,
        stack,
        canvas = false,
        ...options
    }: BarYMarkProps = $derived({ ...DEFAULTS, ...markProps });

    const args = $derived(
        stackY(
            intervalY(
                // by default, sort by x channel (the ordinal labels)
                sort(recordizeY({ data, ...options }))
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
        {@const bw = plot.scales.x.fn.bandwidth()}
        {@const barGroupClass = className ? `bar-y ${className}` : 'bar-y'}
        {#if canvas}
            {@const rectCanvasData = scaledData
                .filter((d) => d.valid)
                .map((d) => {
                    const miny = Math.min(d.y1, d.y2);
                    const maxy = Math.max(d.y1, d.y2);

                    return {
                        ...d,
                        x1: d.x - bw * 0.5,
                        x2: d.x + bw * 0.5,
                        y1: miny,
                        y2: maxy
                    };
                })}
            <GroupMultiple class={barGroupClass} length={scaledData.length}>
                <RectCanvas
                    {options}
                    data={rectCanvasData}
                    {usedScales}
                    useInsetAsFallbackVertically={false} />
            </GroupMultiple>
        {:else}
            <GroupMultiple class="bar-y" length={scaledData.length}>
                {#each scaledData as d, i (i)}
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
        {/if}
    {/snippet}
</Mark>
