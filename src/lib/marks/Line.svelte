<!-- @component
    Creates line charts with connecting points in a dataset with customizable curves and markers
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface LineMarkProps extends MarkerOptions, BaseMarkProps<Datum> {
        data?: Datum[];
        x?: ChannelAccessor<Datum>;
        y?: ChannelAccessor<Datum>;
        z?: ChannelAccessor<Datum>;
        outlineStroke?: string;
        outlineStrokeWidth?: number;
        outlineStrokeOpacity?: number;
        curve?: CurveName | CurveFactory | 'auto';
        tension?: number;
        sort?: ConstantAccessor<RawValue, Datum> | { channel: 'stroke' | 'fill' };
        text?: ConstantAccessor<string, Datum>;
        textFill?: ConstantAccessor<string, Datum>;
        textStroke?: ConstantAccessor<string, Datum>;
        textStartOffset?: ConstantAccessor<string, Datum>;
        textStrokeWidth?: ConstantAccessor<number, Datum>;
        lineClass?: ConstantAccessor<string, Datum>;
        canvas?: boolean;
    }
    import type {
        CurveName,
        DataRecord,
        BaseMarkProps,
        ConstantAccessor,
        ChannelAccessor,
        MarkerOptions,
        ScaledDataRecord
    } from '../types/index.js';
    import Mark from '../Mark.svelte';
    import MarkerPath from './helpers/MarkerPath.svelte';
    import { resolveProp, resolveStyles } from '../helpers/resolve.js';
    import { line, type CurveFactory, type Line as D3Line } from 'd3-shape';
    import { geoPath } from 'd3-geo';
    import callWithProps from '$lib/helpers/callWithProps.js';
    import { maybeCurve } from '$lib/helpers/curves.js';
    import { pick } from 'es-toolkit';
    import LineCanvas from './helpers/LineCanvas.svelte';

    import type { RawValue } from 'svelteplot/types/index.js';
    import { isValid } from '$lib/helpers/index.js';
    import { sort } from '$lib/transforms/sort.js';
    import { recordizeXY } from '$lib/transforms/recordize.js';
    import GroupMultiple from './helpers/GroupMultiple.svelte';
    import { getPlotDefaults } from '$lib/hooks/plotDefaults.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    let markProps: LineMarkProps = $props();

    const DEFAULTS: LineMarkProps = {
        curve: 'auto',
        tension: 0,
        canvas: false,
        class: null,
        lineClass: null,
        ...getPlotDefaults().line
    };

    const {
        data = [{} as Datum],
        curve,
        tension,
        text,
        canvas,
        class: className,
        lineClass,
        ...options
    }: LineMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    const args = $derived(sort(recordizeXY({ data, ...options })));

    /**
     * Groups the data by the specified key
     */
    function groupIndex(data: ScaledDataRecord[], groupByKey: ChannelAccessor<Datum> | null) {
        if (!groupByKey) return [data];
        let group = [];
        const groups = [group];
        let lastGroupValue;
        for (const d of data) {
            const groupValue = resolveProp(groupByKey, d.datum);
            if (groupValue === lastGroupValue) {
                group.push(d);
            } else {
                // new group
                group = [d];
                groups.push(group);
                lastGroupValue = groupValue;
            }
        }
        return groups;
    }

    const groupByKey = $derived(args.z || args.stroke) as ChannelAccessor<Datum> | null;

    const plot = usePlot();

    const linePath: D3Line<ScaledDataRecord> = $derived(
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
        const fn = (lineData: ScaledDataRecord[]) => {
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
        fn.context = path.context;
        return fn;
    }
</script>

<Mark
    type="line"
    channels={['x', 'y', 'opacity', 'stroke', 'strokeOpacity']}
    required={['x', 'y']}
    {...args}>
    {#snippet children({ mark, usedScales, scaledData })}
        {#if scaledData.length > 0}
            {@const groupedLineData = groupIndex(scaledData, groupByKey)}
            {#if canvas}
                <LineCanvas {groupedLineData} {mark} {usedScales} {linePath} {groupByKey} />
            {:else}
                <g class={['lines', className]}>
                    {#each groupedLineData as lineData, i (i)}
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
                                            strokeOpacity: options.outlineStrokeOpacity ?? 1,
                                            strokeWidth:
                                                options.outlineStrokeWidth ||
                                                resolveProp(
                                                    options.strokeWidth,
                                                    lineData[0].datum,
                                                    1.4
                                                ) + 2
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
                                        fill: args.textFill || lineData[0].stroke,
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
                                    datum={lineData[0].datum}
                                    d={pathString}
                                    dInv={text ? linePath(lineData.toReversed()) : null}
                                    color={lineData[0].stroke || 'currentColor'}
                                    {style}
                                    class={styleClass}
                                    text={text ? resolveProp(text, lineData[0].datum) : null}
                                    startOffset={resolveProp(
                                        args.textStartOffset,
                                        lineData[0].datum,
                                        '50%'
                                    )}
                                    {textStyle}
                                    {textStyleClass} />
                            </GroupMultiple>
                        {/if}
                    {/each}
                </g>
            {/if}
        {/if}
    {/snippet}
</Mark>
