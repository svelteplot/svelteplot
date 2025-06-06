<!--
    @component
    For arbitrary rectangles, requires band x and y scales 
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface CellMarkProps
        extends BaseMarkProps<Datum>,
            LinkableMarkProps<Datum>,
            BaseRectMarkProps<Datum> {
        data: Datum[];
        x?: ChannelAccessor<Datum>;
        y?: ChannelAccessor<Datum>;
    }
    import type {
        PlotContext,
        DataRecord,
        BaseMarkProps,
        BaseRectMarkProps,
        ChannelAccessor,
        PlotDefaults,
        LinkableMarkProps,
        MarkType
    } from '../types.js';
    import Mark from '../Mark.svelte';
    import { getContext } from 'svelte';
    import { recordizeY, sort } from '$lib/index.js';
    import { resolveChannel } from '../helpers/resolve.js';

    import { isValid } from '../helpers/isValid.js';
    import RectPath from './helpers/RectPath.svelte';

    let markProps: CellMarkProps = $props();

    const DEFAULTS = {
        ...getContext<PlotDefaults>('svelteplot/_defaults').cell
    };

    const {
        data = [{} as Datum],
        class: className = '',
        ...options
    }: CellMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

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
    type="cell"
    required={['x', 'y']}
    requiredScales={{ x: ['band'], y: ['band'] }}
    channels={['x', 'y', 'fill', 'stroke', 'opacity', 'fillOpacity', 'strokeOpacity']}
    {...args}>
    {#snippet children({ scaledData, usedScales })}
        {@const bwx = plot.scales.x.fn.bandwidth()}
        {@const bwy = plot.scales.y.fn.bandwidth()}
        <g class="cell {className || ''}" data-fill={usedScales.fillOpacity}>
            {#each scaledData as d, i (i)}
                {#if d.valid && (args.fill == null || isValid(resolveChannel('fill', d.datum, args)))}
                    <RectPath
                        datum={d}
                        class={className}
                        {usedScales}
                        options={args}
                        x={d.x - bwx * 0.5}
                        y={d.y - bwy * 0.5}
                        width={bwx}
                        height={bwy} />
                {/if}
            {/each}
        </g>
    {/snippet}
</Mark>
