---
title: Geo mark
---

<script>
    import { setContext } from 'svelte';
    import { writable } from 'svelte/store';
    const canvas = writable(false);
    setContext('useCanvas', canvas);
</script>

The **geo mark** draws geographic features — polygons, lines, points, and other geometry — often as thematic maps. It works with SveltePlot’s [projection system](/features/projections). For example, the [choropleth map](https://en.wikipedia.org/wiki/Choropleth_map) below shows unemployment by county in the United States.

```svelte live
<script>
    import { getContext } from 'svelte';
    import { Plot, Geo } from 'svelteplot';
    import { Slider, Select } from '$shared/ui';
    import { page } from '$app/state';
    import * as topojson from 'topojson-client';

    const useCanvas = getContext('useCanvas');

    const { us, unemployment } = $derived(page.data.data);
    const rateMap = $derived(
        new Map(unemployment.map((d) => [d.id, +d.rate]))
    );
    const counties = $derived(
        topojson
            .feature(us, us.objects.counties)
            .features.map((feat) => {
                return {
                    ...feat,
                    properties: {
                        ...feat.properties,
                        unemployment: rateMap.get(+feat.id)
                    }
                };
            })
    );

    let type = $state('linear');
    let n = $state(5);
</script>

<Select
    bind:value={type}
    options={[
        'linear',
        'quantize',
        'log',
        'sqrt',
        'quantile-cont',
        'quantile'
    ]}
    label="Scale" />
{#if type === 'quantize' || type === 'quantile'}
    <Slider
        label="Steps (n)"
        bind:value={n}
        min={2}
        max={11} />
{/if}
<Plot
    projection="albers-usa"
    color={{
        scheme: 'blues',
        label: 'Unemployment (%)',
        legend: true,
        n,
        type
    }}>
    <Geo
        data={counties}
        canvas={$useCanvas}
        fill={(d) => d.properties.unemployment}
        title={(d) =>
            `${d.properties.name}\n${d.properties.unemployment}%`} />
</Plot>
```

```svelte
<Plot
    projection="albers-usa"
    color={{
        scheme: 'blues',
        legend: true,
        label: 'Unemployment (%)',
        n: 7,
        type: 'quantile'
    }}>
    <Geo
        data={counties}
        fill={(d) => d.properties.unemployment}
        title={(d) =>
            `${d.properties.name}\n${d.properties.unemployment}%`} />
</Plot>
```

[fork](https://svelte.dev/playground/234af6d4d7154b02b43a2be9f9328505?version=5)

Earthquakes SVG

```svelte live
<script>
    import { Plot, Geo, Sphere } from 'svelteplot';
    import { page } from '$app/state';
    import * as topojson from 'topojson-client';

    let { world, earthquakes } = $derived(page.data.data);
    let land = $derived(
        topojson.feature(world, world.objects.land)
    );
</script>

<Plot r={{ range: [0.5, 25] }} projection="equirectangular">
    <Geo data={[land]} fillOpacity="0.2" />
    <Sphere stroke="currentColor" />
    <Geo
        data={earthquakes.features}
        stroke="var(--svp-red)"
        fill="var(--svp-red)"
        fillOpacity="0.2"
        title={(d) => d.properties.title}
        href={(d) => d.properties.url}
        r={(d) => Math.pow(10, d.properties.mag)} />
</Plot>
```

Here's the same map rendered on a canvas instead of SVG:

```svelte live
<script>
    import { Plot, Geo, Sphere } from 'svelteplot';
    import { page } from '$app/state';
    import * as topojson from 'topojson-client';

    let { world, earthquakes } = $derived(page.data.data);
    let land = $derived(
        topojson.feature(world, world.objects.land)
    );
</script>

<Plot r={{ range: [0.5, 25] }} projection="equirectangular">
    <Geo canvas data={[land]} fillOpacity="0.2" />
    <Sphere stroke="currentColor" />
    <Geo
        data={earthquakes.features}
        stroke="var(--svp-red)"
        fill="var(--svp-red)"
        canvas
        fillOpacity="0.2"
        r={(d) => Math.pow(10, d.properties.mag)} />
</Plot>
```

The geo mark’s **geometry** channel can be used to generate geometry from a non-GeoJSON data source.

```svelte live
<script>
    import { Plot, Geo, Sphere } from 'svelteplot';
    import { page } from '$app/state';
    import * as topojson from 'topojson-client';
    import { geoCircle } from 'd3-geo';
    import { Checkbox } from '$shared/ui';
    import { range } from 'd3-array';

    let { world, earthquakes } = $derived(page.data.data);
    let land = $derived(
        topojson.feature(world, world.objects.land)
    );

    import { getContext } from 'svelte';
    const useCanvas = getContext('useCanvas');
</script>

<Checkbox bind:value={$useCanvas} label="use canvas" />
<Plot
    color={{
        legend: true,
        label: 'Distance from Tonga (km)'
    }}
    projection={{ type: 'equal-earth', rotate: [90, 0] }}>
    <Sphere stroke="currentcolor" canvas={$useCanvas} />
    <Geo
        data={[land]}
        stroke="currentcolor"
        canvas={$useCanvas} />
    <Geo
        data={[0.5, 179.5].concat(range(10, 171, 10))}
        canvas={$useCanvas}
        geometry={geoCircle()
            .center([-175.38, -20.57])
            .radius((r) => r)}
        stroke={(r) => r * 111.2}
        strokeWidth={2} />
</Plot>
```

```svelte
<Plot
    color={{
        legend: true,
        label: 'Distance from Tonga (km)'
    }}
    projection={{ type: 'equal-earth', rotate: [90, 0] }}>
    <Sphere stroke="currentColor" />
    <Geo data={[land]} stroke="currentColor" />
    <Geo
        data={[0.5, 179.5].concat(range(10, 171, 10))}
        geometry={geoCircle()
            .center([-175.38, -20.57])
            .radius((r) => r)}
        stroke={(r) => r * 111.2}
        strokeWidth={2} />
</Plot>
```

## Geo

[API Reference](/api/marks#Geo)

## Sphere

[API Reference](/api/marks#Sphere)

## Graticule

[API Reference](/api/marks#Graticule)

The [graticule](https://d3js.org/d3-geo/shape#geoGraticule) helper draws a uniform grid of meridians (lines of constant longitude) and parallels (lines of constant latitude) every 10° between ±80° latitude; for the polar regions, meridians are drawn every 90°. The [sphere](/marks/geo#Sphere) helper draws the outline of the projected sphere.

```svelte live
<script>
    import { Plot, Graticule, Sphere } from 'svelteplot';
    import { Slider } from '$shared/ui';
    import { getContext } from 'svelte';
    const useCanvas = getContext('useCanvas');

    let stepX = $state(10);
    let stepY = $state(10);
</script>

<Slider label="stepX" bind:value={stepX} min={1} max={45} />
<Slider label="stepY" bind:value={stepY} min={1} max={45} />

<Plot
    inset={2}
    projection={{
        type: 'orthographic',
        rotate: [0, -30, 20]
    }}>
    <Sphere stroke="currentColor" canvas={$useCanvas} />
    <Graticule
        strokeOpacity={0.3}
        {stepX}
        {stepY}
        canvas={$useCanvas} />
</Plot>
```

```svelte
<Plot
    inset={2}
    projection={{
        type: 'orthographic',
        rotate: [0, -30, 20]
    }}>
    <Sphere stroke="currentColor" />
    <Graticule strokeOpacity={0.3} stepX={10} stepY={5} />
</Plot>
```

[fork](https://svelte.dev/playground/c574050e755544d795235a296c4518ad?version=5)

You can customize the step size using the following options

- **stepX** - default step size for the minor longitude grid, in degrees
- **stepY** - default step size for the minor latitude grid, in degrees
- **step** - convenience option for setting both _stepX_ and _stepY_
