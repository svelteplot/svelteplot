---
title: Density mark
---

:::info
added in 0.14.0
:::

The **density mark** estimates and renders a [two-dimensional kernel density](https://en.wikipedia.org/wiki/Multivariate_kernel_density_estimation) from scatter data. It uses a Gaussian kernel applied to data projected into pixel space, then draws [iso-density contours](https://en.wikipedia.org/wiki/Contour_line) using the marching-squares algorithm.

:::tip
For one-dimensional kernel density estimates, see the [densityX](/transforms/density) and [densityY](/transforms/density) transforms.
:::

```svelte live
<script lang="ts">
    import { Plot, Density, Dot } from 'svelteplot';
    import { page } from '$app/state';
    import { useDark } from '$shared/ui';

    const ds = useDark();

    const { penguins } = $derived(page.data.data);
</script>

<Plot color={{ scheme: ds.isDark ? 'viridis' : 'blues' }}>
    <Density
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fill="density"
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

[API Reference](/api/marks#Density)

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

You can create separate densities by grouping via stroke or `z` channel:

```svelte live
<script lang="ts">
    import { Plot, Density } from 'svelteplot';
    import { page } from '$app/state';

    const { penguins } = $derived(page.data.data);
</script>

<Plot>
    <Density
        data={penguins}
        stroke="species"
        x="culmen_length_mm"
        y="culmen_depth_mm" />
</Plot>
```

```svelte
<Plot>
    <Density
        data={penguins}
        stroke="species"
        x="culmen_length_mm"
        y="culmen_depth_mm" />
</Plot>
```

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
    import { useDark } from '$shared/ui';

    const ds = useDark();
    const { penguins } = $derived(page.data.data);
</script>

<Plot
    color={{
        scheme: ds.isDark ? 'viridis' : 'blues',
        legend: true
    }}>
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

[Example](/examples/density/colored-isolines)

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
<Plot frame color={{ scheme: 'blues' }}>
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

<Plot inset={10} frame color={{ scheme: 'blues' }}>
    <Density
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fill="density"
        stroke="none"
        thresholds={8}
        fx="species" />
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        r={1.5}
        symbol="plus"
        fx="species" />
</Plot>
```

[Example](/examples/density/faceted)

## Weight channel

Use `weight` to give different data points different contributions to the density estimate. Points with higher weights exert stronger influence on the density:

```svelte live
<script lang="ts">
    import { Plot, Density, Dot } from 'svelteplot';
    import { page } from '$app/state';
    import { Slider } from '$shared/ui';

    let skew = $state(0);

    const { penguins } = $derived(page.data.data);
    // Use body mass as weight
    const data = $derived(
        penguins.filter((d: any) => d.body_mass_g != null)
    );
</script>

<Slider
    bind:value={skew}
    min={-1}
    max={1}
    step={0.01}
    label="Skew (-F/+M)" />
<Plot color={{ legend: true }}>
    <Density
        {data}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        weight={(d) =>
            d.sex === 'FEMALE' ? 1 - skew : 1 + skew}
        thresholds={10} />
    <Dot
        {data}
        fill="sex"
        r={2}
        x="culmen_length_mm"
        y="culmen_depth_mm" />
</Plot>
```
