<script module>
    export const title = 'Inset and Aspect Ratio';
    export const description =
        'Demonstrates how to use inset and aspect ratio in geographic projections.';
    export const data = {
        world: '/data/countries-110m.json'
    };
</script>

<script lang="ts">
    import { Slider } from '$shared/ui';
    import { Plot, Geo } from 'svelteplot';
    import * as topojson from 'topojson-client';
    import { geoCentroid } from 'd3-geo';
    import type { WorldAtlas } from '../types';

    let aspect = $state(0.75);
    let inset = $state(10);

    let { world }: { world: WorldAtlas } = $props();

    let countries = $derived(
        topojson.feature(world, world.objects.countries)
            .features
    );
    let selectedName = $state('Germany');
    const selected = $derived(
        topojson
            .feature(world, world.objects.countries)
            .features.find(
                (d) => d.properties.name === selectedName
            )
    );
    let centroid = $derived(geoCentroid(selected));
</script>

<Slider bind:value={inset} min={0} max={50} label="inset" />
<Slider
    bind:value={aspect}
    min={0.35}
    max={2}
    step={0.01}
    label="aspect" />
<Plot
    projection={{
        type: 'transverse-mercator',
        rotate: [-centroid[0], -centroid[1]],
        inset,
        domain: selected
    }}
    height={(w) => w * aspect}>
    <Geo
        data={countries}
        opacity={0.2}
        fill="currentColor"
        stroke="var(--svelteplot-bg)"
        onclick={(d, e) =>
            (selectedName = e.properties.name)} />
    <Geo data={[selected]} />
</Plot>
