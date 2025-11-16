---
title: Link mark
---

For connecting two points with a line.

```svelte live
<script lang="ts">
    import { Plot, Link, Dot, Text } from '$lib/index.js';
    import { page } from '$app/state';
    let { metros } = $derived(page.data.data);

    let hl = $state(false);
</script>

<Plot
    grid
    marginRight={20}
    inset={10}
    height={450}
    x={{ type: 'log', label: 'Population' }}
    y={{ label: 'Inequality' }}
    color={{
        scheme: 'BuRd',
        pivot: 1.5,
        label: 'Change in inequality from 1980 to 2015',
        legend: true
    }}>
    <Link
        data={metros}
        x1="POP_1980"
        y1="R90_10_1980"
        x2="POP_2015"
        y2="R90_10_2015"
        bend
        markerEnd="arrow"
        style="transition: opacity 0.2s ease-in"
        opacity={{
            scale: null,
            value: (d) =>
                !hl || hl.Metro === d.Metro ? 1 : 0.1
        }}
        onmouseenter={(event, d) => (hl = d)}
        onmouseleave={() => (hl = null)}
        stroke={(d) => d.R90_10_2015 - d.R90_10_1980} />
    <Text
        data={metros}
        x="POP_2015"
        y="R90_10_2015"
        filter={(d) =>
            hl ? d.Metro === hl.Metro : d.highlight}
        text="nyt_display"
        fill="currentColor"
        stroke="var(--svelteplot-bg)"
        strokeWidth={4}
        lineAnchor="bottom"
        dy={-6} />
</Plot>
```

Link support spherical projections:

```svelte live
<script lang="ts">
    import {
        Plot,
        Geo,
        Sphere,
        Link,
        Dot,
        Text
    } from '$lib/index.js';
    import { page } from '$app/state';
    import * as topojson from 'topojson-client';

    let { world } = $derived(page.data.data);
    let land = $derived(
        topojson.feature(world, world.objects.land)
    );

    const link = [-122.4194, 37.7749, 2.3522, 48.8566];
</script>

<Plot projection="equal-earth">
    <Geo data={[land]} fillOpacity="0.3" />
    <Link
        data={[link]}
        text="curve."
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
```
