<!-- @component
    Renders geographical data using projections and GeoJSON geometries
-->
<script lang="ts" generics="Datum = DataRecord | GeoJSON.GeoJsonObject">
    interface GeoMarkProps extends BaseMarkProps<Datum>, LinkableMarkProps<Datum> {
        /** the input GeoJSON data array */
        data?: Datum[] | { type: 'Sphere' }[];
        /** internal: whether this is a sphere or graticule geo mark */
        geoType?: 'sphere' | 'graticule';
        /**
         * todo: implement?
         */
        dragRotate?: boolean;
        /**
         * toggle canvas rendering mode
         */
        canvas?: boolean;
        /**
         * simple browser tooltip to be displayed on mouseover
         */
        title?: ConstantAccessor<string, Datum>;
        /**
         * radius for point features
         */
        r?: ChannelAccessor<Datum>;
        /** SVG filter attribute applied to each geo path element */
        svgFilter?: ConstantAccessor<string | undefined, Datum>;
    }
    import type {
        DataRecord,
        BaseMarkProps,
        ConstantAccessor,
        LinkableMarkProps,
        ChannelAccessor
    } from '../types/index.js';
    import Mark from '../Mark.svelte';
    import { geoPath } from 'd3-geo';
    import { resolveChannel, resolveProp, resolveStyles } from '../helpers/resolve.js';
    import callWithProps from '../helpers/callWithProps.js';
    import { sort } from '../transforms/index.js';
    import { addEventHandlers } from './helpers/events.js';
    import GeoCanvas from './helpers/GeoCanvas.svelte';
    import { recordize } from '../transforms/recordize.js';
    import { GEOJSON_PREFER_STROKE } from '../helpers/index.js';
    import Anchor from './helpers/Anchor.svelte';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';
    import GroupMultiple from './helpers/GroupMultiple.svelte';

    const plot = usePlot();

    let markProps: GeoMarkProps = $props();

    const DEFAULTS = {
        ...getPlotDefaults().geo
    };

    const {
        data = [{} as Datum],
        canvas = false,
        geoType,
        dragRotate,
        class: className = '',
        ...options
    }: GeoMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    const path = $derived(
        callWithProps(
            geoPath,
            [plot.scales.projection],
            options.r
                ? { pointRadius: (d: any) => plot.scales.r.fn(resolveChannel('r', d, options)) }
                : { pointRadius: 3 }
        )
    );

    const args = $derived(
        sort(
            recordize({
                data: data as any[],
                ...(options.r ? { sort: { channel: '-r' } } : {}),
                ...options
            })
        )
    );

    const classes = $derived(['geo', geoType && `geo-${geoType}`, className]);
</script>

<Mark
    type="geo"
    channels={['fill', 'stroke', 'opacity', 'fillOpacity', 'strokeOpacity', 'r']}
    {...args}>
    {#snippet children({ mark, scaledData, usedScales })}
        <GroupMultiple
            aria-label="geo"
            class={scaledData.length > 1 ? classes.filter(Boolean).join(' ') : null}
            length={scaledData.length}>
            {#if canvas}
                <GeoCanvas data={scaledData} {path} {mark} {usedScales} />
            {:else}
                {#each scaledData as d, i (i)}
                    {#if d.valid}
                        <Anchor options={options as any} datum={d.datum}>
                            {@const title = resolveProp(args.title, d.datum, '')}
                            {@const geometry = resolveProp(args.geometry, d.datum, d.datum)}
                            {@const [style, styleClass] = resolveStyles(
                                plot,
                                d,
                                args as any,
                                GEOJSON_PREFER_STROKE.has((geometry as any)?.type)
                                    ? 'stroke'
                                    : 'fill',
                                usedScales
                            )}
                            <path
                                d={path(geometry as any)}
                                {style}
                                aria-label="geo"
                                class={[scaledData.length > 1 ? null : classes, styleClass]}
                                filter={resolveProp(args.svgFilter, d.datum, undefined) as
                                    | string
                                    | undefined}
                                {@attach addEventHandlers({
                                    plot,
                                    options: args as any,
                                    datum: d?.datum
                                })}>
                                {#if title}<title>{title}</title>{/if}
                            </path>
                        </Anchor>
                    {/if}
                {/each}
            {/if}
        </GroupMultiple>
    {/snippet}
</Mark>
