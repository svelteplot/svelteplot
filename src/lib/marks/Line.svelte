<!--
    @component
    Line mark, useful for line charts
-->
<script module lang="ts">
    import type {
        CurveName,
        PlotContext,
        DataRecord,
        BaseMarkProps,
        ConstantAccessor,
        ChannelAccessor,
        MarkerOptions,
        ScaledDataRecord
    } from '../types.js';

    export type BaseLineMarkProps = {
        data: DataRecord[];
        z?: ChannelAccessor;
        stroke?: ChannelAccessor;
        outlineStroke?: ConstantAccessor<string>;
        outlineStrokeWidth?: ConstantAccessor<number>;
        dx?: ConstantAccessor<number>;
        dy?: ConstantAccessor<number>;
        curve?: CurveName | CurveFactory;
        tension?: number;
        sort?: ConstantAccessor<RawValue> | { channel: 'stroke' | 'fill' };
        text?: ConstantAccessor<string>;
        textFill?: ConstantAccessor<string>;
        textStroke?: ConstantAccessor<string>;
        textStartOffset?: ConstantAccessor<string>;
        textStrokeWidth?: ConstantAccessor<number>;
        lineClass?: ConstantAccessor<string>;
    } & MarkerOptions;
</script>

<script lang="ts">
    import Mark from '../Mark.svelte';
    import MarkerPath from './helpers/MarkerPath.svelte';
    import { getContext } from 'svelte';
    import { resolveProp, resolveStyles } from '../helpers/resolve.js';
    import { line, type CurveFactory } from 'd3-shape';
    import { geoPath } from 'd3-geo';
    import callWithProps from '$lib/helpers/callWithProps.js';
    import { maybeCurve } from '$lib/helpers/curves.js';
    import { pick } from 'es-toolkit';

    type LineMarkProps = BaseMarkProps & {
        x?: ChannelAccessor;
        y?: ChannelAccessor;
    } & BaseLineMarkProps;

    import type { RawValue } from '$lib/types.js';
    import { isValid } from '$lib/helpers/index.js';
    import { sort } from '$lib/transforms/sort.js';
    import { recordizeXY } from '$lib/transforms/recordize.js';
    import GroupMultiple from './helpers/GroupMultiple.svelte';

    let {
        data = [{}],
        curve = 'auto',
        tension = 0,
        text,
        class: className = null,
        lineClass = null,
        ...options
    }: LineMarkProps = $props();

    const args = $derived(sort(recordizeXY({ data, ...options })));

    function groupIndex(data: ScaledDataRecord[], groupByKey) {
        if (!groupByKey) return [data];
        let group = [];
        const groups = [group];
        let lastGroupValue;
        for (const d of data) {
            const groupValue = resolveProp(groupByKey, d.datum);
            if (groupValue === lastGroupValue) {
                group.push(d);
            } else {
                if (group.length === 1) {
                    // just one point makes a bad line, add this one, too
                    group.push(d);
                }
                // new group
                group = [d];
                groups.push(group);
                lastGroupValue = groupValue;
            }
        }
        return groups;
    }

    const groupByKey = $derived(args.z || args.stroke);

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    type LinePath = (dr: DataRecord[]) => string;

    const linePath: LinePath = $derived(
        plot.scales.projection && curve === 'auto'
            ? sphereLine(plot.scales.projection)
            : callWithProps(line, [], {
                  curve: maybeCurve(curve === 'auto' ? 'linear' : curve, tension),
                  x: (d) => d.x,
                  y: (d) => d.y,
                  defined: (d) => isValid(d.x) && isValid(d.y)
              })
    );

    function sphereLine(projection) {
        const path = geoPath(projection);
        return (lineData: ScaledDataRecord[]) => {
            let line = [];
            const lines = [line];
            for (const { x, y } of lineData) {
                // if x or y is undefined, start a new line segment
                if (!isValid(x) || !isValid(y)) {
                    line = [];
                    lines.push(line);
                } else {
                    line.push([x, y]);
                }
            }
            return path({ type: 'MultiLineString', coordinates: lines });
        };
    }
</script>

<Mark
    type="line"
    channels={['x', 'y', 'opacity', 'stroke', 'strokeOpacity']}
    required={['x', 'y']}
    {...args}>
    {#snippet children({ mark, usedScales, scaledData })}
        {#if scaledData.length > 0}
            <g class={['lines', className]}>
                {#each groupIndex(scaledData, groupByKey) as lineData, i}
                    {@const pathString = linePath(lineData)}
                    {#if pathString}
                        <GroupMultiple class={resolveProp(lineClass, lineData[0])}>
                            {#if options.outlineStroke}
                                {@const [outlineStyle, outlineStyleClass] = resolveStyles(
                                    plot,
                                    { ...lineData[0], stroke: options.outlineStroke },
                                    {
                                        strokeLinejoin: 'round',
                                        ...args,
                                        stroke: options.outlineStroke,
                                        strokeWidth:
                                            options.outlineStrokeWidth ||
                                            (+options.strokeWidth || 1.4) + 2
                                    },
                                    'stroke',
                                    usedScales
                                )}
                                <path
                                    d={pathString}
                                    style={outlineStyle}
                                    class={['is-outline', outlineStyleClass]} />
                            {/if}
                            {@const [style, styleClass] = resolveStyles(
                                plot,
                                lineData[0],
                                {
                                    strokeWidth: 1.4,
                                    strokeLinejoin: 'round',
                                    ...args,
                                    stroke: lineData[0].stroke
                                },
                                'stroke',
                                usedScales
                            )}
                            {@const [textStyle, textStyleClass] = resolveStyles(
                                plot,
                                lineData[0],
                                {
                                    textAnchor: 'middle',
                                    ...pick(args, [
                                        'fontSize',
                                        'fontWeight',
                                        'fontStyle',
                                        'textAnchor'
                                    ]),
                                    strokeWidth: args.textStrokeWidth
                                        ? args.textStrokeWidth
                                        : args.textStroke
                                          ? 2
                                          : 0,
                                    fill: args.textFill || args.stroke,
                                    stroke: args.textStroke
                                },
                                'fill',
                                usedScales,
                                true
                            )}
                            <MarkerPath
                                {mark}
                                scales={plot.scales}
                                markerStart={args.markerStart}
                                markerMid={args.markerMid}
                                markerEnd={args.markerEnd}
                                marker={args.marker}
                                strokeWidth={args.strokeWidth}
                                datum={lineData[0]}
                                d={pathString}
                                dInv={text ? linePath(lineData.toReversed()) : null}
                                color={lineData[0].stroke || 'currentColor'}
                                {style}
                                class={styleClass}
                                text={text ? resolveProp(text, lineData[0]) : null}
                                startOffset={resolveProp(args.textStartOffset, lineData[0], '50%')}
                                {textStyle}
                                {textStyleClass} />
                        </GroupMultiple>
                    {/if}
                {/each}
            </g>
        {/if}
    {/snippet}
</Mark>
