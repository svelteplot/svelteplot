<!--
    @component
    For arbitrary rectangles, requires band x and y scales 
-->
<script lang="ts">
    import Mark from '../Mark.svelte';
    import { getContext } from 'svelte';
    import { recordizeY, sort } from '$lib/index.js';
    import { roundedRect } from '../helpers/roundedRect.js';
    import { resolveChannel, resolveProp, resolveStyles } from '../helpers/resolve.js';
    import { coalesce, maybeNumber } from '../helpers/index.js';
    import type {
        PlotContext,
        DataRecord,
        BaseMarkProps,
        BaseRectMarkProps,
        ChannelAccessor
    } from '../types.js';
    import { isValid } from '../helpers/isValid.js';
    import { addEventHandlers } from './helpers/events.js';

    type CellProps = BaseMarkProps & {
        data: DataRecord[];
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
    {#snippet children({ mark, scaledData, usedScales })}
        {@const bwx = plot.scales.x.fn.bandwidth()}
        {@const bwy = plot.scales.y.fn.bandwidth()}
        <g class="cell {className || ''}" data-fill={usedScales.fillOpacity}>
            {#each scaledData as d}
                {@const inset = resolveProp(args.inset, d.datum, 0)}
                {@const insetLeft = resolveProp(args.insetLeft, d.datum)}
                {@const insetRight = resolveProp(args.insetRight, d.datum)}
                {@const insetTop = resolveProp(args.insetTop, d.datum)}
                {@const insetBottom = resolveProp(args.insetBottom, d.datum)}
                {@const dx = resolveProp(args.dx, d.datum, 0)}
                {@const dy = resolveProp(args.dy, d.datum, 0)}
                {@const insetL = maybeNumber(coalesce(insetLeft, inset, 0))}
                {@const insetT = maybeNumber(coalesce(insetTop, inset, 0))}
                {@const insetR = maybeNumber(coalesce(insetRight, inset, 0))}
                {@const insetB = maybeNumber(coalesce(insetBottom, inset, 0))}
                {#if d.valid && (args.fill == null || isValid(resolveChannel('fill', d.datum, args)))}
                    {@const [style, styleClass] = resolveStyles(plot, d, args, 'fill', usedScales)}
                    <path
                        d={roundedRect(
                            0,
                            0,
                            bwx - insetL - insetR,
                            bwy - insetT - insetB,
                            options.borderRadius
                        )}
                        class={[styleClass]}
                        {style}
                        transform="translate({[
                            d.x + insetL + dx - bwx * 0.5,
                            d.y + insetT + dy - bwy * 0.5
                        ]})"
                        use:addEventHandlers={{
                            getPlotState,
                            options: args,
                            datum: d.datum
                        }} />
                {/if}
            {/each}
        </g>
    {/snippet}
</Mark>

<style>
    rect {
        stroke: none;
        /* fill: none; */
    }
</style>
