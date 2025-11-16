<script module>
    export const title = 'Spherical Link';
</script>

<script lang="ts">
    import { Plot, Geo, Sphere, Link } from 'svelteplot';
    import { page } from '$app/state';
    import * as topojson from 'topojson-client';
    import type { ExamplesData } from '../types';

    let { world } = $derived(
        page.data.data
    ) as ExamplesData;

    let land = $derived(
        topojson.feature(world, world.objects.land)
    );

    const link = [-122.4194, 37.7749, 2.3522, 48.8566];
</script>

<Plot projection="equal-earth">
    <Geo data={[land]} fillOpacity={0.3} />
    <Link
        data={[link]}
        text="curve"
        x1="2"
        y1="3"
        x2="0"
        y2="1"
        curve="bump-x"
        stroke="red" />
    <Link
        data={[link]}
        text="Foo"
        x1="2"
        y1="3"
        x2="0"
        y2="1"
        textFill="currentColor"
        textStroke="var(--svelteplot-bg)"
        textStrokeWidth={3}
        fontSize={15}
        textAnchor="start"
        textStartOffset="5"
        markerStart="dot"
        markerEnd="arrow" />
    <Sphere stroke="currentColor" />
</Plot>
