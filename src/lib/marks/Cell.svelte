<!--
    @component
    For arbitrary rectangles, requires band x and y scales 
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface CellMarkProps
        extends BaseMarkProps<Datum>, LinkableMarkProps<Datum>, BaseRectMarkProps<Datum> {
        /** the input data array; each element becomes one cell */
        data: Datum[];
        /** the horizontal position channel; typically an ordinal value */
        x?: ChannelAccessor<Datum>;
        /** the vertical position channel; typically an ordinal value */
        y?: ChannelAccessor<Datum>;
        /**
         * Renders using Canvas instead of SVG.
         */
        canvas?: boolean;
    }
    import type {
        DataRecord,
        BaseMarkProps,
        BaseRectMarkProps,
        ChannelAccessor,
        LinkableMarkProps,
        MarkType
    } from '../types/index.js';
    import Mark from '../Mark.svelte';
    import { recordizeY, sort } from '../index.js';
    import { resolveChannel } from '../helpers/resolve.js';

    import { isValid } from '../helpers/index.js';
    import RectPath from './helpers/RectPath.svelte';
    import RectCanvas from './helpers/RectCanvas.svelte';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    let markProps: CellMarkProps = $props();

    const DEFAULTS = {
        ...getPlotDefaults().cell
    };

    const {
        data = [{} as Datum],
        class: className = '',
        canvas = false,
        ...options
    }: CellMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    const plot = usePlot();

    const args = $derived(
        options.sort !== undefined
            ? // user has defined a custom sorting
              sort(recordizeY({ data, ...options }))
            : // sort by x and y
              (sort({
                  ...sort({
                      ...recordizeY({ data, ...options }),
                      sort: { channel: 'x' }
                  }),
                  sort: { channel: 'y' }
              }) as CellMarkProps)
    ) as CellMarkProps;
</script>

<Mark
    required={['x', 'y']}
    requiredScales={{ x: ['band'], y: ['band'] }}
    channels={['x', 'y', 'fill', 'stroke', 'opacity', 'fillOpacity', 'strokeOpacity']}
    {...args}
    type={"cell" as MarkType}>
    {#snippet children({ scaledData, usedScales })}
        {@const bwx = plot.scales.x.fn.bandwidth()}
        {@const bwy = plot.scales.y.fn.bandwidth()}
        <g class="cell {className || ''}" data-fill={usedScales.fillOpacity}>
            {#if canvas}
                {@const rectCanvasData = scaledData
                    .filter(
                        (d) =>
                            d.valid &&
                            (args.fill == null || isValid(resolveChannel('fill', d.datum, args)))
                    )
                    .map((d) => ({
                        ...d,
                        x1: (d.x as number) - bwx * 0.5,
                        x2: (d.x as number) + bwx * 0.5,
                        y1: (d.y as number) - bwy * 0.5,
                        y2: (d.y as number) + bwy * 0.5
                    }))}
                <RectCanvas options={args} data={rectCanvasData} {usedScales} />
            {:else}
                {#each scaledData as d, i (i)}
                    {#if d.valid && (args.fill == null || isValid(resolveChannel('fill', d.datum, args)))}
                        <RectPath
                            datum={d}
                            class={className}
                            {usedScales}
                            options={args}
                            x={(d.x as number) - bwx * 0.5}
                            y={(d.y as number) - bwy * 0.5}
                            width={bwx}
                            height={bwy} />
                    {/if}
                {/each}
            {/if}
        </g>
    {/snippet}
</Mark>
