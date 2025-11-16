<script module lang="ts">
    export const title = 'Geo line';
    export const description =
        'Demonstrates how to use Line mark together with projections.';
    export const repl =
        'https://svelte.dev/playground/8f433172583d4b7eb4ae1d72572d2e31?version=5.33.14';
</script>

<script lang="ts">
    import { Plot, Geo, Dot, Line } from 'svelteplot';
    import { page } from '$app/state';
    import * as topojson from 'topojson-client';
    import type { ExamplesData } from '../types';
    const { world, beagle } = $derived(
        page.data.data
    ) as ExamplesData;
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
