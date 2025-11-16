<script module>
    export const title = 'Earthquakes';
    export const description =
        'A map of earthquakes around the world, with markers sized by magnitude.';
</script>

<script lang="ts">
    import {
        Plot,
        Geo,
        Sphere,
        Graticule
    } from 'svelteplot';
    import { page } from '$app/state';
    import * as topojson from 'topojson-client';
    import type { ExamplesData } from '../types';

    let { world, earthquakes } = $derived(
        page.data.data
    ) as ExamplesData;
    let land = $derived(
        topojson.feature(world, world.objects.land)
    );
</script>

<Plot
    height={500}
    r={{ range: [0.5, 25] }}
    projection={{
        type: 'orthographic',
        rotate: [-120, 10, 0]
    }}>
    <Geo data={[land]} fillOpacity={0.2} />
    <Graticule strokeOpacity={0.1} />
    <Sphere stroke="currentColor" />
    <Geo
        data={earthquakes.features}
        stroke="var(--svp-red)"
        fill="var(--svp-red)"
        fillOpacity={0.2}
        title={(d) => d.properties.title}
        href={(d) => d.properties.url}
        r={(d) => Math.pow(10, d.properties.mag)} />
</Plot>
