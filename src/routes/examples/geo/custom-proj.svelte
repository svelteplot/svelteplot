<script module>
    export const title = 'Custom projection';
    export const description =
        'Demonstrates how to use a custom projection in SveltePlot.';
</script>

<script lang="ts">
    import { Slider } from '$lib/ui';
    import { Plot, Geo, Graticule } from 'svelteplot';
    import { page } from '$app/state';
    import * as topojson from 'topojson-client';
    import { geoOrthographic } from 'd3-geo';

    const { world } = $derived(page.data.data);

    let lat = $state(0);
    let lon = $state(0);
    let zoom = $state(1);

    const countries = $derived(
        topojson.feature(world, world.objects.countries)
            .features
    );
</script>

<Slider bind:value={lat} min={-90} max={90} label="lat" />
<Slider bind:value={lon} min={-180} max={180} label="lon" />
<Slider
    bind:value={zoom}
    min={0.1}
    max={10}
    step={0.01}
    label="zoom" />
<Plot
    inset={5}
    projection={{
        type: ({
            width,
            height
        }: {
            width: number;
            height: number;
        }) =>
            geoOrthographic()
                .translate([width * 0.5, height * 0.5])
                .scale(width * 0.5 * zoom)
                .rotate([-lon, -lat])
    }}
    height={(w) => w}>
    <Graticule opacity={0.1} />
    <Geo
        data={countries}
        fill="currentColor"
        opacity={0.3}
        stroke="var(--svelteplot-bg)" />
</Plot>
