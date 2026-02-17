<!-- @component
    Creates line charts with connecting points in a dataset with customizable curves and markers
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface LineMarkProps extends MarkerOptions, BaseMarkProps<Datum> {
        /** the input data array; each element becomes one point in the line */
        data?: Datum[];
        /** the horizontal position channel */
        x?: ChannelAccessor<Datum>;
        /** the vertical position channel */
        y?: ChannelAccessor<Datum>;
        /** the series channel; data is grouped into separate lines by unique z values */
        z?: ChannelAccessor<Datum>;
        /** the stroke color for the line outline */
        outlineStroke?: string;
        /** the stroke width of the line outline in pixels */
        outlineStrokeWidth?: number;
        /** the stroke opacity for the line outline; a number between 0 and 1 */
        outlineStrokeOpacity?: number;
        /** the curve interpolation method for connecting data points (e.g. "basis", "catmull-rom") */
        curve?: CurveName | CurveFactory | 'auto';
        /** the tension parameter for cardinal or Catmull-Rom curve interpolation */
        tension?: number;
        /** controls the order of data points before rendering */
        sort?: ConstantAccessor<RawValue, Datum> | { channel: 'stroke' | 'fill' };
        /** text label to render along the line path using a textPath element */
        text?: ConstantAccessor<string, Datum>;
        /** the fill color for the text label rendered along the line */
        textFill?: ConstantAccessor<string, Datum>;
        /** the stroke color for the text label rendered along the line */
        textStroke?: ConstantAccessor<string, Datum>;
        /** the offset position for the text label along the line path (e.g. "50%") */
        textStartOffset?: ConstantAccessor<string, Datum>;
        /** the stroke width for the text label rendered along the line in pixels */
        textStrokeWidth?: ConstantAccessor<number, Datum>;
        /** CSS class name(s) to apply to individual line elements */
        lineClass?: ConstantAccessor<string, Datum>;
        /** if true, renders using Canvas instead of SVG */
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
    import callWithProps from '../helpers/callWithProps.js';
    import { maybeCurve } from '../helpers/curves.js';
    import { pick } from 'es-toolkit';
    import LineCanvas from './helpers/LineCanvas.svelte';

    import type { RawValue } from 'svelteplot/types/index.js';
    import { isValid } from '../helpers/index.js';
    import { sort } from '../transforms/sort.js';
    import { recordizeXY } from '../transforms/recordize.js';
    import GroupMultiple from './helpers/GroupMultiple.svelte';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    let markProps: LineMarkProps = $props();

    const DEFAULTS: LineMarkProps = {
        curve: 'auto',
        tension: 0,
        canvas: false,
        markerScale: 1,
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
                                    markerScale={args.markerScale}
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
