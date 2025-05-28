---
title: Projections
---

```svelte live
<script>
    import {
        Plot,
        Dot,
        Geo,
        Sphere,
        Line,
        Graticule
    } from 'svelteplot';
    import { Slider, Select } from '$lib/ui';
    import { tick } from 'svelte';
    import { page } from '$app/state';
    import { geoEqualEarth, geoCircle } from 'd3-geo';
    import * as topojson from 'topojson-client';

    let { world, earthquakes } = $derived(page.data.data);
    let land = $derived(
        topojson.feature(world, world.objects.land)
    );

    let latitude = $state(40);
    let longitude = $state(120);
    let dragging = $state(false);
    let zoom = $state(90);

    let vx = $state(0);
    let vy = $state(0);

    let projection = $state('orthographic');
    const options = [
        /* "albers", */
        'azimuthal-equal-area',
        'azimuthal-equidistant',
        /* 'conic-conformal', */
        'conic-equal-area',
        'conic-equidistant',
        'equal-earth',
        'equirectangular',
        'gnomonic',
        /* 'identity', */
        /* 'reflect-y', */
        'mercator',
        'orthographic',
        'stereographic',
        'transverse-mercator'
    ];

    async function step() {
        longitude = longitude + vx;
        latitude = latitude + vy;
        vx *= 0.9;
        vy *= 0.9;
        if (vx < 0.1) vx = 0;
        if (vy < 0.1) vy = 0;
        await tick();
        window.requestAnimationFrame(step);
    }
</script>

<Select
    bind:value={projection}
    {options}
    label="Projection" />
<button
    on:click={() => {
        vx = 10;
        step();
    }}>spin</button>

<Plot
    r={{ range: [0.5, 25] }}
    projection={{
        type: projection,
        inset: 10,
        domain: geoCircle()
            .center([longitude, latitude])
            .radius(zoom)(),
        rotate: [-longitude, -latitude]
    }}>
    <Sphere
        fill="var(--svelteplot-bg)"
        stroke="currentColor"
        cursor="pointer" />
    <Graticule
        pointerEvents="none"
        opacity="0.1"
        step={zoom > 50 ? 10 : zoom > 20 ? 5 : 1} />
    <Geo
        data={[land]}
        fillOpacity="0.2"
        pointerEvents="none" />
    <Dot
        data={earthquakes.features}
        stroke="var(--svp-red)"
        fill="var(--svp-red)"
        fillOpacity="0.2"
        x={(d) => d.geometry.coordinates[0]}
        y={(d) => d.geometry.coordinates[1]}
        r={(d) => Math.pow(10, d.properties.mag)} />
</Plot>
```

```svelte
<Plot
    r={{ range: [0.5, 25] }}
    projection={{
        type: 'orthographic',
        inset: 10,
        rotate: [-longitude, -latitude]
    }}>
    <Sphere
        fill="var(--svelteplot-bg)"
        stroke="currentColor"
        cursor="pointer"
        onmousedown={() => (dragging = true)}
        onmousemove={(d, evt) => {
            if (dragging) {
                latitude = Math.round(
                    latitude + evt.movementY
                );
                longitude = Math.round(
                    longitude - evt.movementX
                );
            }
        }}
        onmouseup={() => (dragging = false)} />
    <Graticule pointerEvents="none" opacity="0.1" />
    <Geo
        data={[land]}
        pointerEvents="none"
        fillOpacity="0.2" />
    <Dot
        data={earthquakes}
        stroke="var(--svp-red)"
        fill="var(--svp-red)"
        fillOpacity="0.2"
        x="longitude"
        y="latitude"
        r={(d) => Math.pow(10, d.mag)} />
</Plot>
```

Above, a [geo mark](/marks/geo) draws polygons representing land and a [sphere mark](/marks/geo#sphere) draws the outline of the globe. A [dot mark](/marks/dot) draws earthquakes as circles sized by magnitude.

The geo mark is “projection aware” so that it can handle all the nuances of projecting spherical polygons to the screen — leaning on [d3-geo](https://d3js.org/d3-geo) to provide [adaptive sampling](https://observablehq.com/@d3/adaptive-sampling) with configurable precision, [antimeridian cutting](https://observablehq.com/@d3/antimeridian-cutting), and clipping. The dot mark is not; instead, Plot applies the projection in place of the _x_ and _y_ scales. Hence, projections work with any mark that consumes continuous **x** and **y** channels — as well as marks that use **x1** & **y1** and **x2** & **y2**. Each mark implementation decides whether to handle projections specially or to treat the projection as any other position scale. (For example, the [line mark](/marks/line) is projection-aware to draw geodesics.)

Plot provides a variety of built-in projections. And as above, all world projections can be rotated to show a different aspect.

```svelte live
<script>
    import {
        Plot,
        Geo,
        Sphere,
        Graticule
    } from 'svelteplot';
    import { Select } from '$lib/ui';
    import { page } from '$app/state';
    import { geoEqualEarth } from 'd3-geo';
    import * as topojson from 'topojson-client';

    let { world } = $derived(page.data.data);
    let land = $derived(
        topojson.feature(world, world.objects.land)
    );

    let projection = $state('equirectangular');
    const options = [
        /* "albers", */
        'azimuthal-equal-area',
        'azimuthal-equidistant',
        /* 'conic-conformal', */
        'conic-equal-area',
        'conic-equidistant',
        'equal-earth',
        'equirectangular',
        'gnomonic',
        /* 'identity', */
        /* 'reflect-y', */
        'mercator',
        'orthographic',
        'stereographic',
        'transverse-mercator'
    ];
</script>

<Select
    bind:value={projection}
    {options}
    label="Projection" />
<Plot {projection}>
    <Geo data={[land]} />
    <Sphere stroke="currentColor" />
    <Graticule stroke="currentColor" opacity={0.2} />
</Plot>
```

```svelte
<Plot projection="equirectangular">
    <Geo data={[land]} />
    <Sphere stroke="currentColor" />
    <Graticule stroke="currentColor" opacity={0.2} />
</Plot>
```

```svelte live
<script>
    import { Slider } from '$lib/ui';
    import {
        Plot,
        Geo,
        Sphere,
        Graticule
    } from 'svelteplot';
    import { page } from '$app/state';
    import * as topojson from 'topojson-client';
    import { geoCentroid } from 'd3-geo';

    let aspect = $state(0.75);
    let inset = $state(10);

    let { world } = $derived(page.data.data);

    let countries = $derived(
        topojson.feature(world, world.objects.countries)
            .features
    );
    let selected = $state(
        topojson
            .feature(world, world.objects.countries)
            .features.find(
                (d) => d.properties.name === 'Germany'
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
        onclick={(d, e) => (selected = e)} />
    <Geo data={[selected]} />
</Plot>
```

## Custom projections

You can use custom projections if you need more control over the projection parameters like `scale`.

```svelte live
<script>
    import { Slider } from '$lib/ui';
    import {
        Plot,
        Geo,
        Sphere,
        Graticule
    } from 'svelteplot';
    import { page } from '$app/state';
    import * as topojson from 'topojson-client';
    import { geoOrthographic } from 'd3-geo';

    const { world } = $derived(page.data.data);

    let lon = $state(0);
    let zoom = $state(1);

    const countries = $derived(
        topojson.feature(world, world.objects.countries)
            .features
    );
</script>

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
        type: ({ width, height }) =>
            geoOrthographic()
                .translate([width * 0.5, height * 0.5])
                .scale(width * 0.5 * zoom)
                .rotate([-lon, 0])
    }}
    height={(w) => w}>
    >
    <Graticule opacity={0.1} />
    <Geo
        data={countries}
        fill="currentColor"
        opacity={0.3}
        stroke="var(--svelteplot-bg)" />
</Plot>
```

```svelte
<Plot
    inset={5}
    projection={{
        type: ({ width, height }) =>
            geoOrthographic()
                .translate([width * 0.5, height * 0.5])
                .scale(width * 0.5 * zoom)
                .rotate([-lon, 0])
    }}
    height={(w) => w}>
    >
    <Graticule opacity={0.1} />
    <Geo
        data={countries}
        fill="currentColor"
        opacity={0.3}
        stroke="var(--svelteplot-bg)" />
</Plot>
```
