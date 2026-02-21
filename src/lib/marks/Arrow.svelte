<!-- @component
    Creates arrows with customizable heads, angles, and bending
-->
<script lang="ts" generics="Datum = DataRecord | GeoJSON.GeoJsonObject">
    interface ArrowMarkProps extends Omit<BaseMarkProps<Datum>, 'fill' | 'fillOpacity'> {
        /** the input data array; each element becomes one arrow */
        data: Datum[];
        /** controls the order of data before rendering */
        sort?:
            | ConstantAccessor<RawValue>
            | { channel: 'stroke' | 'fill' | 'x1' | 'y1' | 'x2' | 'y2' };
        /** the starting horizontal position channel */
        x1: ChannelAccessor<Datum>;
        /** the starting vertical position channel */
        y1: ChannelAccessor<Datum>;
        /** the ending horizontal position channel */
        x2: ChannelAccessor<Datum>;
        /** the ending vertical position channel */
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
        /** controls the sweep direction of the arrow arc; 1 or -1 */
        sweep?: SweepOption;
    }
    import type {
        DataRecord,
        BaseMarkProps,
        ConstantAccessor,
        ChannelAccessor,
        RawValue
    } from '../types/index.js';
    import { resolveProp, resolveStyles } from '../helpers/resolve.js';
    import { coalesce, maybeNumber } from '../helpers/index.js';
    import Mark from '../Mark.svelte';
    import {
        arrowPath,
        maybeSweep,
        type SweepFunc,
        type SweepOption
    } from '../helpers/arrowPath.js';
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
                { data: indexData(data as object[]), ...options },
                { y: ['y1', 'y2'], x: ['x1', 'x2'] }
            )
        ) as unknown as ArrowMarkProps
    );
</script>

<Mark
    type="arrow"
    required={['x1', 'x2', 'y1', 'y2']}
    channels={['x1', 'y1', 'x2', 'y2', 'opacity', 'stroke', 'strokeOpacity']}
    {...args as any}>
    {#snippet children({ usedScales, scaledData })}
        {@const sweep = maybeSweep(args.sweep) as SweepFunc}
        <GroupMultiple class="arrow" length={scaledData.length}>
            {#each scaledData as d, i (i)}
                {#if d.valid}
                    {@const datum = d.datum as unknown as Datum}
                    {@const inset = resolveProp(args.inset, datum, 0)}
                    {@const insetStart = resolveProp(args.insetStart, datum)}
                    {@const insetEnd = resolveProp(args.insetEnd, datum)}
                    {@const headAngle = (resolveProp(args.headAngle, datum, 60) ?? 60) as number}
                    {@const headLength = (resolveProp(args.headLength, datum, 8) ?? 8) as number}
                    {@const bendVal =
                        args.bend === true
                            ? 22.5
                            : (resolveProp(
                                  args.bend as ConstantAccessor<number, Datum>,
                                  datum,
                                  0
                              ) ?? 0)}
                    {@const strokeWidth = (resolveProp(args.strokeWidth, datum, 1) ?? 1) as number}
                    {@const arrPath = arrowPath(
                        d.x1 ?? 0,
                        d.y1 ?? 0,
                        d.x2 ?? 0,
                        d.y2 ?? 0,
                        maybeNumber(coalesce(insetStart, inset)) ?? 0,
                        maybeNumber(coalesce(insetEnd, inset)) ?? 0,
                        headAngle,
                        headLength,
                        bendVal,
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
                            options: options as any,
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
