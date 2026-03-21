---
title: Density mark
---

:::info
added in 0.13.0
:::

[API Reference](/api/marks#Density)

```svelte live
<script lang="ts">
    import { Plot, Density, Dot } from 'svelteplot';
    import { page } from '$app/state';

    const { penguins } = $derived(page.data.data);
</script>

<Plot color={{ scheme: 'blues' }}>
    <Density
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fill="density"
        stroke="none"
        thresholds={10} />
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fill="currentColor"
        r={1.5}
        opacity={0.4} />
</Plot>
```

The **density mark** estimates and renders a [two-dimensional kernel density](https://en.wikipedia.org/wiki/Multivariate_kernel_density_estimation) from scatter data. It uses a Gaussian kernel applied to data projected into pixel space, then draws [iso-density contours](https://en.wikipedia.org/wiki/Contour_line) using the marching-squares algorithm.

:::info
For one-dimensional kernel density estimates, see the [densityX](/transforms/density) and [densityY](/transforms/density) transforms.
:::

## Basic usage

Pass `data` with `x` and `y` channels. The mark computes density across the plot area and draws contour lines at automatically-chosen levels:

```svelte
<Plot>
    <Density
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm" />
</Plot>
```

```svelte live
<script lang="ts">
    import { Plot, Density } from 'svelteplot';
    import { page } from '$app/state';

    const { penguins } = $derived(page.data.data);
</script>

<Plot>
    <Density
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm" />
</Plot>
```

[Example](/examples/density/basic)

## Filled density bands

Set `fill="density"` to fill each contour band by its estimated density using the plot's color scale. Pair with `stroke="none"` to suppress the isoline strokes:

```svelte
<Plot color={{ scheme: 'blues' }}>
    <Density
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fill="density"
        stroke="none"
        thresholds={10} />
</Plot>
```

```svelte live
<script lang="ts">
    import { Plot, Density } from 'svelteplot';
    import { page } from '$app/state';

    const { penguins } = $derived(page.data.data);
</script>

<Plot color={{ scheme: 'blues', legend: true }}>
    <Density
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fill="density"
        stroke="none"
        thresholds={10} />
</Plot>
```

[Example](/examples/density/filled)

## Colored isolines

Use `stroke="density"` to color each isoline by its density level:

```svelte live
<script lang="ts">
    import { Plot, Density } from 'svelteplot';
    import { page } from '$app/state';

    const { penguins } = $derived(page.data.data);
</script>

<Plot color={{ scheme: 'viridis', legend: true }}>
    <Density
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="density"
        thresholds={15} />
</Plot>
```

## Bandwidth

The `bandwidth` option (default 20) controls the Gaussian kernel's standard deviation in screen pixels. A larger bandwidth produces a smoother, more blurred estimate; a smaller one reveals finer structure at the cost of more noise.

```svelte live
<script lang="ts">
    import { Plot, Density } from 'svelteplot';
    import { Slider } from '$shared/ui';
    import { page } from '$app/state';

    const { penguins } = $derived(page.data.data);
    let bandwidth = $state(20);
</script>

<Slider
    label="bandwidth"
    bind:value={bandwidth}
    min={5}
    max={60} />

<Plot color={{ scheme: 'blues' }}>
    <Density
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fill="density"
        stroke="none"
        thresholds={10}
        {bandwidth} />
</Plot>
```

## Thresholds

Control the number and placement of density levels with `thresholds`:

- **count** (number): approximately that many evenly-spaced levels (default 20)
- **explicit array**: exact density threshold values in k-scaled units

```svelte live
<script lang="ts">
    import { Plot, Density } from 'svelteplot';
    import { Slider } from '$shared/ui';
    import { page } from '$app/state';

    const { penguins } = $derived(page.data.data);
    let thresholds = $state(10);
</script>

<Slider
    label="thresholds"
    bind:value={thresholds}
    min={2}
    max={30} />

<Plot>
    <Density
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        {thresholds} />
</Plot>
```

## Faceting

The density mark supports faceting via `fx` and `fy`. Each facet panel computes its own density from the subset of data that belongs to that panel. Thresholds are derived from the global density maximum across all facets, keeping the color scale consistent between panels.

```svelte
<Plot color={{ scheme: 'blues' }}>
    <Density
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fill="density"
        stroke="none"
        fy="species" />
</Plot>
```

```svelte live
<script lang="ts">
    import { Plot, Density, Dot } from 'svelteplot';
    import { page } from '$app/state';

    const { penguins } = $derived(page.data.data);
</script>

<Plot color={{ scheme: 'blues', legend: true }}>
    <Density
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fill="density"
        stroke="none"
        thresholds={8}
        fy="species" />
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fill="species"
        r={1.5}
        fy="species" />
</Plot>
```

[Example](/examples/density/faceted)

## Combining with Dot

Overlaying the raw scatter data on top of the density estimate often gives the clearest picture of the distribution:

```svelte live
<script lang="ts">
    import { Plot, Density, Dot } from 'svelteplot';
    import { page } from '$app/state';

    const { iris } = $derived(page.data.data);
</script>

<Plot color={{ scheme: 'purples' }}>
    <Density
        data={iris}
        x="Sepal.Length"
        y="Sepal.Width"
        fill="density"
        stroke="none"
        thresholds={8} />
    <Dot
        data={iris}
        x="Sepal.Length"
        y="Sepal.Width"
        fill="Species"
        r={2} />
</Plot>
```

## Weight channel

Use `weight` to give different data points different contributions to the density estimate. Points with higher weights exert stronger influence on the density:

```svelte live
<script lang="ts">
    import { Plot, Density, Dot } from 'svelteplot';
    import { page } from '$app/state';

    const { penguins } = $derived(page.data.data);
    // Use body mass as weight
    const data = $derived(
        penguins.filter((d: any) => d.body_mass_g != null)
    );
</script>

<Plot>
    <Density
        {data}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        weight="body_mass_g"
        thresholds={10} />
</Plot>
```
