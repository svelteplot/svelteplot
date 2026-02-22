<!-- @component
    Creates connections between pairs of points with optional curve styling and markers
-->

<script lang="ts" generics="Datum = DataRecord | GeoJSON.GeoJsonObject">
    interface LinkMarkProps extends BaseMarkProps<Datum>, MarkerOptions {
        /** the input data array; each element becomes one link */
        data?: Datum[];
        /** sort order for data points before rendering */
        sort?: ConstantAccessor<RawValue, Datum> | { channel: 'stroke' | 'fill' };
        /**
         * the x1 channel accessor for the start of the link
         */
        x1?: ChannelAccessor<Datum>;
        /**
         * the y1 channel accessor for the start of the link
         */
        y1?: ChannelAccessor<Datum>;
        /**
         * the x2 channel accessor for the end of the link
         */
        x2?: ChannelAccessor<Datum>;
        /** the y2 channel accessor for the end of the link */
        y2?: ChannelAccessor<Datum>;
        /**
         * the curve type, defaults to 'auto' which uses a linear curve for planar projections
         * and a spherical line for geographic projections
         */
        curve?: 'auto' | CurveName | CurveFactory;
        /**
         * the tension of the curve, defaults to 0
         */
        tension?: number;
        /** legacy alias for link curvature */
        bend?: number | boolean;
        /**
         * the text label for the link, can be a constant or a function
         */
        text?: ConstantAccessor<string, Datum>;
        /** the fill color for the text label rendered along the link */
        textFill?: ConstantAccessor<string, Datum>;
        /** the stroke color for the text label rendered along the link */
        textStroke?: ConstantAccessor<string, Datum>;
        /** the offset position for the text label along the link path */
        textStartOffset?: ConstantAccessor<string, Datum>;
        /** the stroke width for the text label rendered along the link */
        textStrokeWidth?: ConstantAccessor<number, Datum>;
    }
    import type {
        DataRecord,
        BaseMarkProps,
        ConstantAccessor,
        ChannelAccessor,
        CurveName,
        MarkerOptions,
        RawValue,
        ScaledDataRecord
    } from '../types/index.js';
    import { resolveChannel, resolveProp, resolveStyles } from '../helpers/resolve.js';
    import Mark from '../Mark.svelte';
    import MarkerPath from './helpers/MarkerPath.svelte';
    import { replaceChannels } from '../transforms/rename.js';
    import { line, type CurveFactory, type Line as D3Line } from 'd3-shape';
    import type { MarkerShape } from './helpers/Marker.svelte';
    import { maybeCurve } from '../helpers/curves.js';
    import { geoPath } from 'd3-geo';
    import { pick } from 'es-toolkit';
    import { sort } from 'svelteplot/transforms/sort.js';
    import { indexData } from 'svelteplot/transforms/recordize.js';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    let markProps: LinkMarkProps = $props();
    const DEFAULTS = {
        markerScale: 1,
        ...getPlotDefaults().link
    };
    const {
        data = [{} as Datum],
        curve = 'auto',
        tension = 0,
        bend,
        text,
        class: className = '',
        ...options
    }: LinkMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    const plot = usePlot();

    const args = $derived(
        replaceChannels(
            sort({
                data: indexData(data as object[]) as DataRecord[],
                stroke: 'currentColor',
                ...(options as BaseMarkProps<DataRecord>)
            }),
            { y: ['y1', 'y2'], x: ['x1', 'x2'] }
        )
    );

    const sphericalLine = $derived(plot.scales.projection && curve === 'auto');

    const linePath: (d: ScaledDataRecord, reversed?: boolean) => string | null = $derived.by(() => {
        const fn: D3Line<[number, number]> = line<[number, number]>()
            .curve(
                maybeCurve(
                    curve === 'auto' ? 'linear' : curve,
                    bend === true ? 0.6 : bend === false ? 0 : (bend ?? tension ?? 0)
                )
            )
            .x((d) => d[0])
            .y((d) => d[1]);

        return (d: ScaledDataRecord, reversed = false) =>
            fn(
                reversed
                    ? [
                          [d.x2 as number, d.y2 as number],
                          [d.x1 as number, d.y1 as number]
                      ]
                    : [
                          [d.x1 as number, d.y1 as number],
                          [d.x2 as number, d.y2 as number]
                      ]
            );
    });

    const sphericalLinePath: (d: ScaledDataRecord, reversed?: boolean) => string | null =
        $derived.by(() => {
            const fn = sphereLine(plot.scales.projection);
            return (d: ScaledDataRecord, reversed = false) => {
                const x1 = resolveChannel('x1', d.datum, args);
                const y1 = resolveChannel('y1', d.datum, args);
                const x2 = resolveChannel('x2', d.datum, args);
                const y2 = resolveChannel('y2', d.datum, args);
                return reversed
                    ? fn(x2 as number, y2 as number, x1 as number, y1 as number)
                    : fn(x1 as number, y1 as number, x2 as number, y2 as number);
            };
        });
    //     sphericalLine
    //         ?

    //         sphereLine(plot.scales.projection)
    //         :
    // );

    function sphereLine(projection: any) {
        const path = geoPath(projection);
        return (x1: number, y1: number, x2: number, y2: number) => {
            return path({
                type: 'LineString',
                coordinates: [
                    [x1, y1],
                    [x2, y2]
                ]
            });
        };
    }
</script>

<Mark
    type="link"
    required={['x1', 'x2', 'y1', 'y2']}
    channels={['x1', 'y1', 'x2', 'y2', 'opacity', 'stroke', 'strokeOpacity']}
    {...args}>
    {#snippet children({ mark, scaledData, usedScales })}
        <g class={['link', className]} data-use-x={usedScales.x ? 1 : 0}>
            {#each scaledData as d, i (i)}
                {#if d.valid || true}
                    {@const [style, styleClass] = resolveStyles(
                        plot,
                        d,
                        { strokeWidth: 1.6, ...args },
                        'stroke',
                        usedScales
                    )}
                    {@const [textStyle, textStyleClass] = resolveStyles(
                        plot,
                        d,
                        {
                            textAnchor: 'middle',
                            ...pick(args, ['fontSize', 'fontWeight', 'fontStyle']),
                            fill: options.textFill || args.stroke,
                            stroke: options.textStroke,
                            strokeWidth: options.textStrokeWidth
                        },
                        'fill',
                        usedScales
                    )}

                    <MarkerPath
                        mark={{ ...mark, options: args }}
                        transform=""
                        scales={plot.scales}
                        markerStart={options.markerStart as boolean | MarkerShape | undefined}
                        markerEnd={options.markerEnd as boolean | MarkerShape | undefined}
                        marker={options.marker as boolean | MarkerShape | undefined}
                        markerScale={options.markerScale}
                        class={styleClass ?? undefined}
                        strokeWidth={options.strokeWidth as ConstantAccessor<number>}
                        datum={d.datum as DataRecord}
                        color={d.stroke ?? 'currentColor'}
                        d={(sphericalLine ? sphericalLinePath(d) : linePath(d)) ?? ''}
                        dInv={(sphericalLine ? sphericalLinePath(d, true) : linePath(d, true)) ??
                            undefined}
                        style={style ?? ''}
                        text={text ? ((resolveProp(text, d.datum as Datum) as string) ?? '') : ''}
                        startOffset={(resolveProp(
                            options.textStartOffset,
                            d.datum as Datum,
                            '50%'
                        ) as string) ?? '50%'}
                        textStyle={textStyle ?? ''}
                        {textStyleClass} />
                {/if}
            {/each}
        </g>
    {/snippet}
</Mark>
