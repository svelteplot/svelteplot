<!-- @component
    Renders geographical data using projections and GeoJSON geometries
-->
<script module lang="ts">
    export type GeoMarkProps = {
        data: DataRecord[];
        geoType?: 'sphere' | 'graticule';
        dragRotate: boolean;
        canvas: boolean;
        href: ConstantAccessor<string>;
        target: ConstantAccessor<string>;
    } & BaseMarkProps &
        LinkableMarkProps;
</script>

<script lang="ts">
    import { getContext } from 'svelte';
    import type {
        DataRecord,
        PlotContext,
        BaseMarkProps,
        ConstantAccessor,
        LinkableMarkProps
    } from '../types.js';
    import Mark from '../Mark.svelte';
    import { geoPath } from 'd3-geo';
    import { resolveChannel, resolveProp, resolveStyles } from '$lib/helpers/resolve.js';
    import callWithProps from '$lib/helpers/callWithProps.js';
    import { sort } from '$lib/index.js';
    import { addEventHandlers } from './helpers/events.js';
    import GeoCanvas from './helpers/GeoCanvas.svelte';
    import { recordize } from '$lib/transforms/recordize.js';
    import { GEOJSON_PREFER_STROKE } from '$lib/helpers/index.js';

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    let {
        data = [{}],
        canvas = false,
        geoType,
        dragRotate,
        class: className = null,
        ...options
    }: GeoMarkProps = $props();

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
        {#snippet el(d)}
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
                use:addEventHandlers={{
                    getPlotState,
                    options: args,
                    datum: d.datum
                }}>
                {#if title}<title>{title}</title>{/if}
            </path>
        {/snippet}
        <g
            aria-label="geo"
            class={['geo', geoType && `geo-${geoType}`, className]}
            style="fill:currentColor">
            {#if canvas}
                <GeoCanvas data={scaledData} {path} {mark} {usedScales} />
            {:else}
                {#each scaledData as d, i (i)}
                    {#if d.valid}
                        {#if options.href}
                            <a
                                href={resolveProp(args.href, d.datum, '')}
                                target={resolveProp(args.target, d.datum, '_self')}>
                                {@render el(d)}
                            </a>
                        {:else}
                            {@render el(d)}
                        {/if}
                    {/if}
                {/each}
            {/if}
        </g>
    {/snippet}
</Mark>
