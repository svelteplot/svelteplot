<!-- @component
    Creates arrows with customizable heads, angles, and bending
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface ArrowMarkProps extends Omit<BaseMarkProps<Datum>, 'fill' | 'fillOpacity'> {
        data: Datum[];
        sort?:
            | ConstantAccessor<RawValue>
            | { channel: 'stroke' | 'fill' | 'x1' | 'y1' | 'x2' | 'y2' };
        x1: ChannelAccessor<Datum>;
        y1: ChannelAccessor<Datum>;
        x2: ChannelAccessor<Datum>;
        y2: ChannelAccessor<Datum>;
        /**
         * the bend angle, in degrees; defaults to 0°; true for 22.5°
         */
        bend?: ConstantAccessor<number, Datum> | true;
        /**
         * the arrowhead angle, in degrees; defaults to 60°
         */
        headAngle?: ConstantAccessor<number, Datum>;
        /**
         * the arrowhead scale; defaults to 8
         */
        headLength?: ConstantAccessor<number, Datum>;
        /**
         * inset at the end of the arrow (useful if the arrow points to a dot)
         */
        insetEnd?: ConstantAccessor<number, Datum>;
        /**
         * inset at the start of the arrow
         */
        insetStart?: ConstantAccessor<number, Datum>;
        /**
         * shorthand for the two insets
         */
        inset?: ConstantAccessor<number, Datum>;
        sweep?: SweepOption;
    }
    import type {
        DataRecord,
        BaseMarkProps,
        ConstantAccessor,
        ChannelAccessor,
        RawValue,
        PlotDefaults
    } from '../types/index.js';
    import { resolveProp, resolveStyles } from '../helpers/resolve.js';
    import { coalesce, maybeNumber } from '../helpers/index.js';
    import Mark from '../Mark.svelte';
    import { arrowPath, maybeSweep, type SweepOption } from '../helpers/arrowPath.js';
    import { replaceChannels } from '../transforms/rename.js';
    import { addEventHandlers } from './helpers/events.js';
    import GroupMultiple from './helpers/GroupMultiple.svelte';
    import { sort } from '../transforms/sort.js';
    import { indexData } from 'svelteplot/transforms/recordize.js';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    let markProps: ArrowMarkProps = $props();

    const DEFAULTS = {
        headAngle: 60,
        headLength: 8,
        inset: 0,
        ...getPlotDefaults().arrow
    };

    const {
        data = [{} as Datum],
        class: className = '',
        ...options
    }: ArrowMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    const plot = usePlot();

    const args: ArrowMarkProps = $derived(
        sort(
            replaceChannels(
                { data: indexData(data), ...options },
                { y: ['y1', 'y2'], x: ['x1', 'x2'] }
            )
        )
    );
</script>

<Mark
    type="arrow"
    required={['x1', 'x2', 'y1', 'y2']}
    channels={['x1', 'y1', 'x2', 'y2', 'opacity', 'stroke', 'strokeOpacity']}
    {...args}>
    {#snippet children({ usedScales, scaledData })}
        {@const sweep = maybeSweep(args.sweep)}
        <GroupMultiple class="arrow" length={scaledData.length}>
            {#each scaledData as d, i (i)}
                {#if d.valid}
                    {@const inset = resolveProp(args.inset, d.datum, 0)}
                    {@const insetStart = resolveProp(args.insetStart, d.datum)}
                    {@const insetEnd = resolveProp(args.insetEnd, d.datum)}
                    {@const headAngle = resolveProp(args.headAngle, d.datum)}
                    {@const headLength = resolveProp(args.headLength, d.datum)}
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
                        {@attach addEventHandlers({
                            plot,
                            options,
                            datum: d?.datum
                        })}>
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
