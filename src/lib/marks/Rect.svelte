<!--
    @component
    For arbitrary rectangles, requires quantitative x and y scales 
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface RectMarkProps
        extends BaseMarkProps<Datum>, LinkableMarkProps<Datum>, BaseRectMarkProps<Datum> {
        /** the input data array; each element becomes one rectangle */
        data?: Datum[];
        /** the horizontal position channel; used as shorthand for x1 and x2 with an interval */
        x?: ChannelAccessor<Datum>;
        /** the starting horizontal position channel */
        x1?: ChannelAccessor<Datum>;
        /** the ending horizontal position channel */
        x2?: ChannelAccessor<Datum>;
        /** the vertical position channel; used as shorthand for y1 and y2 with an interval */
        y?: ChannelAccessor<Datum>;
        /** the starting vertical position channel */
        y1?: ChannelAccessor<Datum>;
        /** the ending vertical position channel */
        y2?: ChannelAccessor<Datum>;
        /** converts x/y into x1/x2 or y1/y2 ranges based on the provided interval */
        interval?: number | string;
        /** additional CSS class name(s) for the rect element */
        class?: string;
        /**
         * Renders using Canvas instead of SVG.
         */
        canvas?: boolean;
    }
    import Mark from '../Mark.svelte';
    import { intervalX, intervalY } from '../index.js';
    import type {
        DataRecord,
        BaseMarkProps,
        BaseRectMarkProps,
        ChannelAccessor,
        LinkableMarkProps
    } from '../types/index.js';
    import GroupMultiple from './helpers/GroupMultiple.svelte';
    import RectPath from './helpers/RectPath.svelte';
    import RectCanvas from './helpers/RectCanvas.svelte';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    let markProps: RectMarkProps = $props();

    const DEFAULTS = {
        ...getPlotDefaults().rect
    };

    const {
        data = [{} as Datum],
        class: className = '',
        canvas = false,
        ...options
    }: RectMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    const plot = usePlot();

    const args = $derived(intervalY(intervalX({ data, ...options })) as RectMarkProps);
</script>

<Mark
    required={[]}
    channels={['x1', 'x2', 'y1', 'y2', 'fill', 'stroke', 'opacity', 'fillOpacity', 'strokeOpacity']}
    {...markProps}
    {...args}
    type="rect">
    {#snippet children({ usedScales, scaledData })}
        {#if canvas}
            {@const rectCanvasData = scaledData.map((d) => {
                const x1 = d.x1 == null ? plot.options.marginLeft + d.dx : d.x1;
                const x2 = d.x2 == null ? plot.options.marginLeft + plot.facetWidth + d.dx : d.x2;
                const y1 = d.y1 == null ? plot.options.marginTop + d.dy : d.y1;
                const y2 = d.y2 == null ? plot.options.marginTop + plot.facetHeight + d.dy : d.y2;
                const minx = Math.min(x1, x2);
                const maxx = Math.max(x1, x2);
                const miny = Math.min(y1, y2);
                const maxy = Math.max(y1, y2);

                return { ...d, x1: minx, x2: maxx, y1: miny, y2: maxy };
            })}
            <GroupMultiple class={className} length={scaledData.length}>
                <RectCanvas options={args} data={rectCanvasData} {usedScales} />
            </GroupMultiple>
        {:else}
            <GroupMultiple
                class={scaledData.length > 1 ? className : null}
                length={scaledData.length}>
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
        {/if}
    {/snippet}
</Mark>
