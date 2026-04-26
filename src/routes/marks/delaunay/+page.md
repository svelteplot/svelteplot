---
title: Delaunay / Voronoi marks
---

:::info
added in 0.14.0
:::

The Delaunay marks compute a [Delaunay triangulation](https://en.wikipedia.org/wiki/Delaunay_triangulation) or its dual [Voronoi diagram](https://en.wikipedia.org/wiki/Voronoi_diagram) from **x** and **y** positions. Five marks are available:

| Mark             | Description                                  |
| ---------------- | -------------------------------------------- |
| **DelaunayLink** | Individual triangle edges (per-edge styling) |
| **DelaunayMesh** | Full triangulation as a single path          |
| **Hull**         | Convex hull (supports grouping)              |
| **Voronoi**      | Individual Voronoi cells (per-cell styling)  |
| **VoronoiMesh**  | Full Voronoi diagram as a single path        |

## Voronoi

The **Voronoi** mark partitions the plane into cells, one per data point, each containing the area closest to that point. Per-cell styling is supported via the standard fill and stroke channels.

```svelte live
<script>
  import { Plot, Voronoi, Dot, Frame } from 'svelteplot';
  import { page } from '$app/state';

  const { penguins } = $derived(page.data.data);
</script>

<Plot testid="voronoi-penguins">
  <Voronoi
    data={penguins}
    x="culmen_length_mm"
    y="culmen_depth_mm"
    fill="species"
    fillOpacity={0.3}
    stroke="var(--svelteplot-bg)" />
  <Dot
    data={penguins}
    x="culmen_length_mm"
    y="culmen_depth_mm"
    fill="species"
    r={2} />
  <Frame />
</Plot>
```

```svelte
<Plot>
  <Voronoi
    data={penguins}
    x="culmen_length_mm"
    y="culmen_depth_mm"
    fill="species"
    fillOpacity={0.3}
    stroke="species" />
  <Dot
    data={penguins}
    x="culmen_length_mm"
    y="culmen_depth_mm"
    fill="species"
    r={2} />
  <Frame />
</Plot>
```

[Example](/examples/delaunay/voronoi-penguins)

## VoronoiMesh

The **VoronoiMesh** mark renders the full Voronoi diagram as a single `<path>`, useful for a lighter visual or background grid.

```svelte live
<script>
  import { Plot, VoronoiMesh, Dot } from 'svelteplot';
  import { page } from '$app/state';

  const { penguins } = $derived(page.data.data);
</script>

<Plot testid="voronoi-mesh">
  <VoronoiMesh
    data={penguins}
    x="culmen_length_mm"
    y="culmen_depth_mm"
    strokeOpacity={0.3} />
  <Dot
    data={penguins}
    x="culmen_length_mm"
    y="culmen_depth_mm"
    fill="species"
    r={3} />
</Plot>
```

```svelte
<Plot>
  <VoronoiMesh
    data={penguins}
    x="culmen_length_mm"
    y="culmen_depth_mm"
    strokeOpacity={0.3} />
  <Dot
    data={penguins}
    x="culmen_length_mm"
    y="culmen_depth_mm"
    fill="species"
    r={3} />
</Plot>
```

The Delaunay marks work great with the [projection](/marks/geo) system. Here is a Voronoi mesh over Walmart store locations in the USA:

```svelte live
<script>
  import { Plot, Geo, Dot, VoronoiMesh } from 'svelteplot';
  import { page } from '$app/state';
  import * as topojson from 'topojson-client';

  const { walmart, statesTopo } = $derived(page.data.data);

  const land = $derived(
    topojson.feature(statesTopo, statesTopo.objects.land)
  );
</script>

<Plot
  projection="albers-usa"
  height={420}
  testid="voronoi-walmart">
  <Geo
    data={[land]}
    stroke="currentColor"
    strokeWidth={1} />
  <VoronoiMesh
    data={walmart}
    x="lon"
    y="lat"
    strokeOpacity={0.2} />
  <Dot data={walmart} x="lon" y="lat" r={1} fill />
</Plot>
```

```svelte
<Plot projection="albers-usa" height={420}>
  <Geo data={[land]} stroke="currentColor" />
  <VoronoiMesh
    data={walmart}
    x="lon"
    y="lat"
    strokeOpacity={0.2} />
  <Dot data={walmart} x="lon" y="lat" r={1} fill />
</Plot>
```

[Example](/examples/delaunay/voronoi-mesh-penguins) · [Example](/examples/delaunay/voronoi-mesh-walmart)

## DelaunayMesh

The **DelaunayMesh** mark renders the full Delaunay triangulation as a single `<path>`.

```svelte live
<script>
  import { Plot, DelaunayMesh, Dot } from 'svelteplot';
  import { page } from '$app/state';

  const { penguins } = $derived(page.data.data);
</script>

<Plot grid testid="delaunay-mesh">
  <DelaunayMesh
    data={penguins}
    x="culmen_length_mm"
    y="culmen_depth_mm"
    strokeOpacity={0.3} />
  <Dot
    data={penguins}
    x="culmen_length_mm"
    y="culmen_depth_mm"
    fill="species"
    r={3} />
</Plot>
```

```svelte
<Plot grid>
  <DelaunayMesh
    data={penguins}
    x="culmen_length_mm"
    y="culmen_depth_mm"
    stroke="species"
    z="species"
    strokeOpacity={0.3} />
  <Dot
    data={penguins}
    x="culmen_length_mm"
    y="culmen_depth_mm"
    fill="species"
    r={3} />
</Plot>
```

[Example](/examples/delaunay/delaunay-mesh)

You can use the `z` channel to group the meshes:

```svelte live
<script>
  import { Plot, DelaunayMesh, Dot } from 'svelteplot';
  import { page } from '$app/state';

  const { penguins } = $derived(page.data.data);
</script>

<Plot grid testid="delaunay-mesh">
  <DelaunayMesh
    data={penguins}
    x="culmen_length_mm"
    y="culmen_depth_mm"
    stroke="species"
    z="species"
    strokeOpacity={0.7} />
  <Dot
    data={penguins}
    x="culmen_length_mm"
    y="culmen_depth_mm"
    fill="species"
    r={3} />
</Plot>
```

```svelte
<Plot grid>
  <DelaunayMesh
    data={penguins}
    x="culmen_length_mm"
    y="culmen_depth_mm"
    stroke="species"
    z="species"
    strokeOpacity={0.7} />
  <Dot
    data={penguins}
    x="culmen_length_mm"
    y="culmen_depth_mm"
    fill="species"
    r={3} />
</Plot>
```

[Example](/examples/delaunay/delaunay-mesh-grouped)

## DelaunayLink

The **DelaunayLink** mark renders individual Delaunay edges as separate paths, allowing per-edge styling from the source data point.

```svelte live
<script>
  import { Plot, DelaunayLink, Dot } from 'svelteplot';
  import { page } from '$app/state';

  const { penguins } = $derived(page.data.data);
</script>

<Plot grid color={{ legend: true }}>
  <DelaunayLink
    data={penguins}
    x="culmen_length_mm"
    y="culmen_depth_mm"
    stroke="body_mass_g"
    strokeOpacity={0.55} />
  <Dot
    data={penguins}
    x="culmen_length_mm"
    y="culmen_depth_mm"
    fill
    r={2} />
</Plot>
```

```svelte
<Plot grid>
  <DelaunayLink
    data={penguins}
    x="culmen_length_mm"
    y="culmen_depth_mm"
    stroke="species"
    strokeOpacity={0.5} />
  <Dot
    data={penguins}
    x="culmen_length_mm"
    y="culmen_depth_mm"
    fill="species"
    r={3} />
</Plot>
```

[Example](/examples/delaunay/delaunay-link)

## Hull

The **Hull** mark renders the convex hull of data points. Use the **z**, **fill**, or **stroke** channel to draw separate hulls per group.

```svelte live
<script>
  import { Plot, Hull, Dot } from 'svelteplot';
  import { page } from '$app/state';

  const { penguins } = $derived(page.data.data);
</script>

<Plot grid testid="hull-species">
  <Hull
    data={penguins}
    x="culmen_length_mm"
    y="culmen_depth_mm"
    stroke="species"
    fill="species"
    fillOpacity={0.1}
    strokeWidth={2} />
  <Dot
    data={penguins}
    x="culmen_length_mm"
    y="culmen_depth_mm"
    fill="species"
    r={3} />
</Plot>
```

```svelte
<Plot grid>
  <Hull
    data={penguins}
    x="culmen_length_mm"
    y="culmen_depth_mm"
    stroke="species"
    fill="species"
    fillOpacity={0.1}
    strokeWidth={2} />
  <Dot
    data={penguins}
    x="culmen_length_mm"
    y="culmen_depth_mm"
    fill="species"
    r={3} />
</Plot>
```

[Example](/examples/delaunay/hull-species)
