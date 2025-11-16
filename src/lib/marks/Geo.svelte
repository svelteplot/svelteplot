<!-- @component
    Renders geographical data using projections and GeoJSON geometries
-->
<script lang="ts" generics="Datum = DataRecord | GeoJSON.GeoJsonObject">
    interface GeoMarkProps extends BaseMarkProps<Datum>, LinkableMarkProps<Datum> {
        data?: Datum[] | { type: 'Sphere' }[];
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
    }
    import { getContext } from 'svelte';
    import type {
        DataRecord,
        PlotContext,
        BaseMarkProps,
        ConstantAccessor,
        LinkableMarkProps,
        ChannelAccessor
    } from '../types/index.js';
    import Mark from '../Mark.svelte';
    import { geoPath } from 'd3-geo';
    import { resolveChannel, resolveProp, resolveStyles } from '$lib/helpers/resolve.js';
    import callWithProps from '$lib/helpers/callWithProps.js';
    import { sort } from '$lib/transforms/index.js';
    import { addEventHandlers } from './helpers/events.js';
    import GeoCanvas from './helpers/GeoCanvas.svelte';
    import { recordize } from '$lib/transforms/recordize.js';
    import { GEOJSON_PREFER_STROKE } from '$lib/helpers/index.js';
    import Anchor from './helpers/Anchor.svelte';
    import { getPlotDefaults } from '$lib/hooks/plotDefaults.js';

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

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
        callWithProps(geoPath, [plot.scales.projection], {
            ...(options.r
                ? { pointRadius: (d) => plot.scales.r.fn(resolveChannel('r', d, options)) }
                : { pointRadius: 3 })
        })
    );

    const args = $derived(
        sort(
            recordize({
                data,
                ...(options.r ? { sort: { channel: '-r' } } : {}),
                ...options
            })
        )
    );
</script>

<Mark
    type="geo"
    channels={['fill', 'stroke', 'opacity', 'fillOpacity', 'strokeOpacity', 'r']}
    {...args}>
    {#snippet children({ mark, scaledData, usedScales })}
        <g
            aria-label="geo"
            class={['geo', geoType && `geo-${geoType}`, className]}
            style="fill:currentColor">
            {#if canvas}
                <GeoCanvas data={scaledData} {path} {mark} {usedScales} />
            {:else}
                {#each scaledData as d, i (i)}
                    {#if d.valid}
                        <Anchor {options} datum={d.datum}>
                            {@const title = resolveProp(args.title, d.datum, '')}
                            {@const geometry = resolveProp(args.geometry, d.datum, d.datum)}
                            {@const [style, styleClass] = resolveStyles(
                                plot,
                                d,
                                args,
                                GEOJSON_PREFER_STROKE.has(geometry.type) ? 'stroke' : 'fill',
                                usedScales
                            )}
                            <path
                                d={path(geometry)}
                                {style}
                                class={[styleClass]}
                                {@attach addEventHandlers({
                                    getPlotState,
                                    options: args,
                                    datum: d?.datum
                                })}>
                                {#if title}<title>{title}</title>{/if}
                            </path>
                        </Anchor>
                    {/if}
                {/each}
            {/if}
        </g>
    {/snippet}
</Mark>
