<!-- @component
    Creates connections between pairs of points with optional curve styling and markers
-->

<script lang="ts" generics="Datum extends DataRecord">
    interface LinkMarkProps extends BaseMarkProps<Datum>, MarkerOptions {
        data: Datum[];
        sort?: ConstantAccessor<RawValue> | { channel: 'stroke' | 'fill' };
        /**
         * the x1 channel accessor for the start of the link
         */
        x1: ChannelAccessor<Datum>;
        /**
         * the y1 channel accessor for the start of the link
         */
        y1: ChannelAccessor<Datum>;
        /**
         * the x2 channel accessor for the end of the link
         */
        x2: ChannelAccessor<Datum>;

        y2: ChannelAccessor<Datum>;
        /**
         * the curve type, defaults to 'auto' which uses a linear curve for planar projections
         * and a spherical line for geographic projections
         */
        curve?: 'auto' | CurveName | CurveFactory;
        /**
         * the tension of the curve, defaults to 0
         */
        tension?: number;
        /**
         * the text label for the link, can be a constant or a function
         */
        text?: ConstantAccessor<string, Datum>;
    }
    import { getContext } from 'svelte';
    import type {
        PlotContext,
        DataRecord,
        BaseMarkProps,
        ConstantAccessor,
        ChannelAccessor,
        CurveName,
        MarkerOptions,
        RawValue,
        ScaledDataRecord,
        PlotDefaults
    } from '../types/index.js';
    import { resolveChannel, resolveProp, resolveStyles } from '../helpers/resolve.js';
    import { maybeData } from '../helpers/index.js';
    import Mark from '../Mark.svelte';
    import MarkerPath from './helpers/MarkerPath.svelte';
    import { replaceChannels } from '$lib/transforms/rename.js';
    import { line, type CurveFactory } from 'd3-shape';
    import callWithProps from '$lib/helpers/callWithProps.js';
    import { maybeCurve } from '$lib/helpers/curves.js';
    import { geoPath } from 'd3-geo';
    import { pick } from 'es-toolkit';

    let markProps: LinkMarkProps = $props();
    const DEFAULTS = {
        ...getContext<PlotDefaults>('svelteplot/_defaults').link
    };
    const {
        data = [{} as Datum],
        curve = 'auto',
        tension = 0,
        text,
        class: className = '',
        ...options
    }: LinkMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    let plot = $derived(getPlotState());

    const sorted = $derived(
        options.sort
            ? maybeData(data).toSorted((a, b) =>
                  resolveChannel('sort', a, options) > resolveChannel('sort', b, options) ? 1 : -1
              )
            : maybeData(data)
    );

    const args = $derived(
        replaceChannels(
            { data: sorted, stroke: 'currentColor', ...options },
            { y: ['y1', 'y2'], x: ['x1', 'x2'] }
        )
    );

    const sphericalLine = $derived(plot.scales.projection && curve === 'auto');

    const linePath: (d: ScaledDataRecord, reversed: boolean) => string = $derived.by(() => {
        const fn = callWithProps(line, [], {
            curve: maybeCurve(curve === 'auto' ? 'linear' : curve, tension),
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
