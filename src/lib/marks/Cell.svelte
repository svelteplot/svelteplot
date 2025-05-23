<!--
    @component
    For arbitrary rectangles, requires band x and y scales 
-->
<script lang="ts">
    import Mark from '../Mark.svelte';
    import { getContext } from 'svelte';
    import { recordizeY, sort } from '$lib/index.js';
    import { resolveChannel } from '../helpers/resolve.js';
    import type {
        PlotContext,
        DataRow,
        BaseMarkProps,
        BaseRectMarkProps,
        ChannelAccessor
    } from '../types.js';
    import { isValid } from '../helpers/isValid.js';
    import RectPath from './helpers/RectPath.svelte';

    type CellProps = BaseMarkProps & {
        data: DataRow[];
        x?: ChannelAccessor;
        y?: ChannelAccessor;
        borderRadius?:
            | number
            | {
                  topLeft?: number;
                  topRight?: number;
                  bottomRight?: number;
                  bottomLeft?: number;
              };
    } & BaseRectMarkProps;

    let { data = [{}], class: className = null, ...options }: CellProps = $props();

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
              }) as Props)
    );
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
            {#each scaledData as d}
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
