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
    import { line, type CurveFactory } from 'd3-shape';
    import callWithProps from '../helpers/callWithProps.js';
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
                data: indexData(data),
                stroke: 'currentColor',
                ...options
            }),
            { y: ['y1', 'y2'], x: ['x1', 'x2'] }
        )
    );

    const sphericalLine = $derived(plot.scales.projection && curve === 'auto');

    const linePath: (d: ScaledDataRecord, reversed: boolean) => string = $derived.by(() => {
        const fn = callWithProps(line, [], {
            curve: maybeCurve(
                curve === 'auto' ? 'linear' : curve,
                bend === true ? 0.6 : bend === false ? tension : (bend ?? tension)
            ),
            x: (d) => d[0],
            y: (d) => d[1]
        });

        return (d: ScaledDataRecord, reversed = false) =>
            fn(
                reversed
                    ? [
                          [d.x2, d.y2],
                          [d.x1, d.y1]
                      ]
                    : [
                          [d.x1, d.y1],
                          [d.x2, d.y2]
                      ]
            );
    });

    const sphericalLinePath: (d: ScaledDataRecord, reversed: boolean) => string = $derived.by(
        () => {
            const fn = sphereLine(plot.scales.projection);
            return (d: ScaledDataRecord, reversed = false) => {
                const x1 = resolveChannel('x1', d.datum, args);
                const y1 = resolveChannel('y1', d.datum, args);
                const x2 = resolveChannel('x2', d.datum, args);
                const y2 = resolveChannel('y2', d.datum, args);
                return reversed ? fn(x2, y2, x1, y1) : fn(x1, y1, x2, y2);
            };
        }
    );
    //     sphericalLine
    //         ?

    //         sphereLine(plot.scales.projection)
    //         :
    // );

    function sphereLine(projection) {
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
                            ...pick(args, ['fontSize', 'fontWeight', 'fontStyle', 'textAnchor']),
                            fill: args.textFill || args.stroke,
                            stroke: args.textStroke,
                            strokeWidth: args.textStrokeWidth
                        },
                        'fill',
                        usedScales
                    )}

                    <MarkerPath
                        mark={{ ...mark, options: args }}
                        scales={plot.scales}
                        markerStart={args.markerStart}
                        markerEnd={args.markerEnd}
                        marker={args.marker}
                        markerScale={args.markerScale}
                        class={styleClass}
                        strokeWidth={args.strokeWidth}
                        datum={d.datum}
                        color={d.stroke}
                        d={sphericalLine ? sphericalLinePath(d) : linePath(d)}
                        dInv={sphericalLine ? sphericalLinePath(d, true) : linePath(d, true)}
                        {style}
                        text={text ? resolveProp(text, d.datum) : null}
                        startOffset={resolveProp(args.textStartOffset, d.datum, '50%')}
                        {textStyle}
                        {textStyleClass} />
                {/if}
            {/each}
        </g>
    {/snippet}
</Mark>
