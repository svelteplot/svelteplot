<!--
    @component Arrow2
-->
<script lang="ts">
    import { getContext, type Snippet } from 'svelte';
    import type {
        PlotContext,
        DataRecord,
        BaseMarkProps,
        ConstantAccessor,
        ChannelAccessor,
        FacetContext,
        RawValue
    } from '../types.js';
    import { resolveChannel, resolveProp, resolveStyles } from '../helpers/resolve.js';
    import { coalesce, maybeData, maybeNumber } from '../helpers/index.js';
    import Mark from '../Mark.svelte';
    import { arrowPath, maybeSweep, type SweepOption } from '../helpers/arrowPath.js';
    import { replaceChannels } from '$lib/transforms/rename.js';
    import { addEventHandlers } from './helpers/events.js';
    import GroupMultiple from './helpers/GroupMultiple.svelte';

    type ArrowProps = BaseMarkProps & {
        data: DataRecord[];
        sort?: ConstantAccessor<RawValue> | { channel: 'stroke' | 'fill' };
        x1: ChannelAccessor;
        y1: ChannelAccessor;
        x2: ChannelAccessor;
        y2: ChannelAccessor;
        stroke?: ChannelAccessor;
        /**
         * the bend angle, in degrees; defaults to 0°; true for 22.5°
         */
        bend?: ConstantAccessor<number> | true;
        /**
         * the arrowhead angle, in degrees; defaults to 60°
         */
        headAngle?: ConstantAccessor<number>;
        /**
         * the arrowhead scale; defaults to 8
         */
        headLength?: ConstantAccessor<number>;
        /**
         * inset at the end of the arrow (useful if the arrow points to a dot)
         */
        insetEnd?: ConstantAccessor<number>;
        /**
         * inset at the start of the arrow
         */
        insetStart?: ConstantAccessor<number>;
        /**
         * shorthand for the two insets
         */
        inset?: ConstantAccessor<number>;
        sweep?: SweepOption;
        children?: Snippet;
    };

    let { data = [{}], class: className = null, ...options }: ArrowProps = $props();

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    const sorted = $derived(
        options.sort
            ? maybeData(data).toSorted((a, b) =>
                  resolveChannel('sort', a, options) > resolveChannel('sort', b, options) ? 1 : -1
              )
            : maybeData(data)
    );

    const args: ArrowProps = $derived(
        replaceChannels({ data: sorted, ...options }, { y: ['y1', 'y2'], x: ['x1', 'x2'] })
    );
</script>

<Mark
    type="arrow"
    required={['x1', 'x2', 'y1', 'y2']}
    channels={['x1', 'y1', 'x2', 'y2', 'opacity', 'stroke', 'strokeOpacity']}
    {...args}>
    {#snippet children({ mark, usedScales, scaledData })}
        {@const sweep = maybeSweep(args.sweep)}
        <GroupMultiple class="arrow" length={scaledData.length}>
            {#each scaledData as d}
                {#if d.valid}
                    {@const inset = resolveProp(args.inset, d.datum, 0)}
                    {@const insetStart = resolveProp(args.insetStart, d.datum)}
                    {@const insetEnd = resolveProp(args.insetEnd, d.datum)}
                    {@const headAngle = resolveProp(args.headAngle, d.datum, 60)}
                    {@const headLength = resolveProp(args.headLength, d.datum, 8)}
                    {@const bend = resolveProp(args.bend, d.datum, 0)}
                    {@const strokeWidth = resolveProp(args.strokeWidth, d.datum, 1)}
                    {@const arrPath = arrowPath(
                        d.x1,
                        d.y1,
                        d.x2,
                        d.y2,
                        maybeNumber(coalesce(insetStart, inset)),
                        maybeNumber(coalesce(insetEnd, inset)),
                        headAngle,
                        headLength,
                        bend === true ? 22.5 : bend === false ? 0 : bend,
                        strokeWidth,
                        sweep
                    )}
                    {@const [style, styleClass] = resolveStyles(
                        plot,
                        d,
                        {
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            ...args,
                            strokeWidth: strokeWidth ?? 1.6
                        },
                        'stroke',
                        usedScales
                    )}
                    <g
                        class={[className]}
                        use:addEventHandlers={{
                            getPlotState,
                            options: args,
                            datum: d.datum
                        }}>
                        {#if options.onmouseenter || options.onclick}
                            <!-- add invisible path in bg for easier mouse access -->
                            <path
                                d={arrPath}
                                style="fill:none;stroke-width: {(strokeWidth || 1) +
                                    10}; stroke: red; stroke-opacity:0" />
                        {/if}
                        <path class={[styleClass]} d={arrPath} {style} />
                    </g>
                {/if}
            {/each}
        </GroupMultiple>
    {/snippet}
</Mark>
