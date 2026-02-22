<script module lang="ts">
    export const title = 'Geo line';
    export const description =
        'Demonstrates how to use Line mark together with projections. Based on an example from <a href="https://observablehq.com/@observablehq/plot-spherical-line">Observable Plot</a> (data via <a href="https://observablehq.com/@bmschmidt/data-driven-projections-darwins-world">Benjamin Schmidt</a>).';
    export const data = {
        world: '/data/countries-110m.json',
        beagle: '/data/beagle.csv'
    };
</script>

<script lang="ts">
    import { Plot, Geo, Dot, Line } from 'svelteplot';
    import * as topojson from 'topojson-client';
    import type { ExamplesData } from '../types';
    const { world, beagle } = $props() as ExamplesData;
    const land = $derived(
        topojson.feature(world, world.objects.land)
    );
</script>

<Plot projection="equirectangular">
    <Geo data={[land]} stroke="currentColor" />
    <Line
        data={beagle}
        x="lon"
        y="lat"
        stroke="var(--svp-red)" />
    <Geo
        data={[
            { type: 'Point', coordinates: [-0.13, 51.5] }
        ]}
        fill="var(--svp-red)" />
</Plot>
