<!--
    @component
    For horizontal bar charts using a band scale as y axis
-->
<script lang="ts">
    import Mark from '../Mark.svelte';
    import { getContext } from 'svelte';
    import { stackX, recordizeX, intervalX, sort } from '$lib/index.js';
    import { resolveProp, resolveStyles } from '../helpers/resolve.js';
    import { roundedRect } from '../helpers/roundedRect.js';
    import type { PlotContext, BaseMarkProps, RectMarkProps, ChannelAccessor } from '../types.js';
    import type { StackOptions } from '$lib/transforms/stack.js';
    import type { DataRow } from '$lib/types.js';
    import { addEventHandlers } from './helpers/events.js';
    import GroupMultiple from './helpers/GroupMultiple.svelte';

    type BarXProps = BaseMarkProps & {
        data: DataRow[];
        x?: ChannelAccessor;
        x1?: ChannelAccessor;
        x2?: ChannelAccessor;
        y?: ChannelAccessor;
        stack?: StackOptions;
        borderRadius?:
            | number
            | {
                  topLeft?: number;
                  topRight?: number;
                  bottomRight?: number;
                  bottomLeft?: number;
              };
    } & RectMarkProps;

    let { data = [{}], class: className = null, stack, ...options }: BarXProps = $props();

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    const args = $derived(
        stackX(
            intervalX(
                // by default, sort by y channel (the ordinal labels)
                sort(recordizeX({ data, sort: { channel: 'y' }, ...options })),
                { plot }
            ),
            stack
        )
    );

    $inspect({args})
</script>

<Mark
    type="barX"
    requiredScales={{ y: ['band'] }}
    channels={['x1', 'x2', 'y', 'fill', 'stroke', 'opacity', 'fillOpacity', 'strokeOpacity']}
    {...args}>
    {#snippet children({ mark, usedScales, scaledData })}
        <GroupMultiple class="bar-x" length={scaledData.length}>
            {#each scaledData as d}
                {@const bw = plot.scales.y.fn.bandwidth()}
                {@const minx = Math.min(d.x1, d.x2)}
                {@const maxx = Math.max(d.x1, d.x2)}
                {@const inset = resolveProp(args.inset, d.datum, 0)}
                {@const dx = resolveProp(args.dx, d.datum, 0)}
                {@const dy = resolveProp(args.dy, d.datum, 0)}
                {#if d.valid}
                    {@const [style, styleClass] = resolveStyles(plot, d, args, 'fill', usedScales)}
                    <path
                        d={roundedRect(0, 0, maxx - minx, bw - inset * 2, options.borderRadius)}
                        class={[styleClass, className]}
                        {style}
                        transform="translate({[minx + dx, d.y + inset + dy - bw * 0.5]})"
                        use:addEventHandlers={{
                            getPlotState,
                            options: args,
                            datum: d.datum
                        }} />
                {/if}
            {/each}
        </GroupMultiple>
    {/snippet}
</Mark>
