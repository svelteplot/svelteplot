---
title: Contour mark
---

[API Reference](/api/marks#Contour)

```svelte live
<script lang="ts">
    import { Plot, Contour } from 'svelteplot';
    import { page } from '$app/state';

    const { volcano } = $derived(page.data.data);
</script>

<Plot color={{ scheme: 'turbo' }}>
    <Contour
        data={volcano.values}
        width={volcano.width}
        height={volcano.height}
        blur={0.5}
        smooth
        strokeWidth={1.5}
        stroke="value" />
</Plot>
```

The **contour mark** renders [isolines](https://en.wikipedia.org/wiki/Contour_line) (or filled contour bands) from a scalar field using the [marching squares](https://en.wikipedia.org/wiki/Marching_squares) algorithm. It shares the same three input modes as the [Raster mark](./raster):

- **Dense grid** — `data` is a flat row-major array with explicit `width` and `height`.
- **Scatter interpolation** — `data` is an array of records with `x`/`y` channels; values are spatially interpolated before contouring.
- **Function sampling** — `value` is an `(x, y) => number` function evaluated on a pixel grid.

The `value` channel names the scalar field to contour. `fill` and `stroke` style the output paths; use `"value"` for either to map each contour level's threshold through the plot's color scale.

## Dense grid mode

The volcano example uses an 87 × 61 elevation grid of [Maungawhau (Mt. Eden)](https://en.wikipedia.org/wiki/Maungawhau_/_Mount_Eden). Contour lines are drawn at automatically-chosen elevation levels:

```svelte
<Plot>
    <Contour
        data={volcano.values}
        width={volcano.width}
        height={volcano.height} />
</Plot>
```

```svelte live
<script lang="ts">
    import { Plot, Contour } from 'svelteplot';
    import { page } from '$app/state';

    const { volcano } = $derived(page.data.data);
</script>

<Plot>
    <Contour
        data={volcano.values}
        width={volcano.width}
        height={volcano.height} />
</Plot>
```

:::info
Some examples on this page are based on the [Observable Plot contour mark documentation](https://observablehq.com/plot/marks/contour).
:::

Set `stroke="value"` to color each isoline by its threshold level using the plot's color scale:

```svelte
<Plot color={{ scheme: 'turbo' }}>
    <Contour
        data={volcano.values}
        width={volcano.width}
        height={volcano.height}
        stroke="value" />
</Plot>
```

```svelte live
<script lang="ts">
    import { Plot, Contour } from 'svelteplot';
    import { page } from '$app/state';

    const { volcano } = $derived(page.data.data);
</script>

<Plot color={{ scheme: 'turbo' }}>
    <Contour
        data={volcano.values}
        width={volcano.width}
        height={volcano.height}
        stroke="value" />
</Plot>
```

[Example](/examples/contour/volcano)

Set `fill="value"` for a choropleth-style heatmap:

```svelte
<Plot color={{ scheme: 'turbo' }}>
    <Contour
        data={volcano.values}
        width={volcano.width}
        height={volcano.height}
        fill="value" />
</Plot>
```

```svelte live
<script lang="ts">
    import { Plot, Contour } from 'svelteplot';
    import { page } from '$app/state';

    const { volcano } = $derived(page.data.data);
</script>

<Plot color={{ scheme: 'turbo', legend: true }}>
    <Contour
        data={volcano.values}
        width={volcano.width}
        height={volcano.height}
        fill="value"
        stroke="none" />
</Plot>
```

## Scatter interpolation

When data comes from [irregularly distributed point observations](/examples/dot/weather) rather than a grid, the contour mark can spatially interpolate the values before running marching squares. This example uses temperature measurements from Canadian weather stations:

```svelte live
<script lang="ts">
    import { Plot, Contour, Geo } from 'svelteplot';
    import { page } from '$app/state';
    import { Select, Slider } from '$shared/ui';
    import * as topojson from 'topojson-client';

    const { weather, canadaTopo } = $derived(
        page.data.data
    );
    const weatherData = $derived(
        weather.filter((d) => d.Tx != null)
    );
    const land = $derived(
        topojson.feature(
            canadaTopo,
            canadaTopo.objects.land
        )
    );
    const innerBorders = $derived(
        topojson.feature(
            canadaTopo,
            canadaTopo.objects.innerborders
        )
    );

    const INTERPOLATIONS = [
        'nearest',
        'barycentric',
        'random-walk'
    ];
    let interpolate = $state('random-walk');
    let blur = $state(2);
</script>

<Select
    label="interpolate"
    options={INTERPOLATIONS}
    bind:value={interpolate} />

<Plot
    projection={{
        type: 'conic-conformal',
        domain: land,
        rotate: [96, 0],
        center: [0, 56],
        parallels: [49, 77]
    }}
    color={{
        scheme: 'burd',
        type: 'diverging',
        legend: true
    }}>
    <defs>
        <clipPath id="canada-land">
            <Geo data={[land]} />
        </clipPath>
    </defs>
    <Contour
        data={weatherData}
        x="Long"
        y="Lat"
        value="Tx"
        fill="value"
        clipPath="url(#canada-land)"
        stroke="none"
        blur={1}
        {interpolate} />
    <Geo data={[land]} stroke="currentColor" fill={null} />
    <Geo
        data={[innerBorders]}
        stroke="currentColor"
        strokeOpacity={0.3}
        fill={null} />
</Plot>
```

[Example](/examples/contour/weather)

The same four interpolation strategies available in the [Raster mark](./raster#scatter-interpolation) apply here: `none`, `nearest`, `barycentric`, and `random-walk`.

## Function sampling mode

Omit `data` and pass `value` as an `(x, y) => number` function with explicit domain bounds. The mark evaluates the function at each grid pixel:

```svelte
<Plot color={{ type: 'diverging' }}>
    <Contour
        value={(x, y) => Math.sin(x) * Math.cos(y)}
        x1={0}
        x2={6 * Math.PI}
        y1={0}
        y2={4 * Math.PI}
        fill="value" />
</Plot>
```

```svelte live
<script lang="ts">
    import { Plot, Contour } from 'svelteplot';
</script>

<Plot color={{ type: 'diverging' }} aspectRatio={1.2}>
    <Contour
        value={(x, y) => Math.sin(x) * Math.cos(y)}
        x1={0}
        x2={6 * Math.PI}
        y1={0}
        y2={4 * Math.PI}
        fill="value" />
</Plot>
```

[Example](/examples/contour/sampled)

## Smooth and blur

`smooth` (default `true`) enables linear interpolation along contour edges, producing smooth curves. Set it to `false` for a blocky, stepped appearance. `blur` applies a Gaussian blur to the value grid before contouring, which suppresses noise and merges closely-spaced levels:

```svelte
<script>
    let smooth = $state(true);
    let blur = $state(0);
</script>

<Checkbox bind:value={smooth} label="smooth" />
<Slider
    bind:value={blur}
    label="blur"
    min={0}
    max={6}
    step={0.1} />

<Plot>
    <Contour
        data={volcano.values}
        width={volcano.width}
        height={volcano.height}
        {smooth}
        {blur} />
</Plot>
```

```svelte live
<script lang="ts">
    import { Plot, Contour } from 'svelteplot';
    import { Checkbox, Slider } from '$shared/ui';
    import { page } from '$app/state';

    const { volcano } = $derived(page.data.data);

    let smooth = $state(true);
    let blur = $state(0);
</script>

<Checkbox bind:value={smooth} label="smooth" />
<Slider
    bind:value={blur}
    label="blur"
    min={0}
    max={6}
    step={0.1} />

<Plot>
    <Contour
        data={volcano.values}
        width={volcano.width}
        height={volcano.height}
        {smooth}
        {blur} />
</Plot>
```

## Controlling threshold levels

Use `thresholds` to set the approximate number of levels, an explicit array, or a function.

```svelte live
<script lang="ts">
    import { Plot, Contour } from 'svelteplot';
    import { Slider } from '$shared/ui';
    import { page } from '$app/state';

    const { volcano } = $derived(page.data.data);
    let thresholds = $state(10);
</script>

<Slider
    label="thresholds"
    bind:value={thresholds}
    min={3}
    max={40} />
<Plot marginTop={10}>
    <Contour
        data={volcano.values}
        width={volcano.width}
        height={volcano.height}
        {thresholds} />
</Plot>
```

```svelte
<Contour data={...} thresholds={10}  />
```

Use `interval` for evenly-spaced steps:

```svelte live
<script lang="ts">
    import { Plot, Contour } from 'svelteplot';
    import { Slider } from '$shared/ui';
    import { page } from '$app/state';

    const { volcano } = $derived(page.data.data);
    let interval = $state(10);
</script>

<Slider
    label="interval"
    bind:value={interval}
    min={3}
    max={40} />
<Plot marginTop={10}>
    <Contour
        data={volcano.values}
        width={volcano.width}
        height={volcano.height}
        {interval} />
</Plot>
```

```svelte
<Contour interval={10} />
```

You can also pass an explicit array of threshold values:

```svelte live
<script lang="ts">
    import { Plot, Contour } from 'svelteplot';
    import { page } from '$app/state';

    const { volcano } = $derived(page.data.data);
</script>

<Plot color={{ scheme: 'turbo', legend: true }}>
    <Contour
        data={volcano.values}
        width={volcano.width}
        height={volcano.height}
        thresholds={[
            90, 100, 110, 120, 130, 140, 150, 160, 170, 180
        ]}
        stroke="value" />
</Plot>
```

## Quantile thresholds

With evenly-spaced thresholds, contour bands cover equal data ranges but unequal numbers of observations, so a sequential color scale may devote most of its ramp to a sparse region. Passing a precomputed quantile array to `thresholds` ensures each band covers the same proportion of the value distribution. This works especially well for skewed data such as temperature across a continent:

```svelte live
<script lang="ts">
    import { Plot, Contour, Geo } from 'svelteplot';
    import { quantileSorted } from 'd3-array';
    import Slider from '$shared/ui/Slider.svelte';
    import { page } from '$app/state';
    import * as topojson from 'topojson-client';

    const { weather, canadaTopo } = $derived(
        page.data.data
    );
    const weatherData = $derived(
        weather.filter((d) => d.Tx != null)
    );
    const land = $derived(
        topojson.feature(
            canadaTopo,
            canadaTopo.objects.land
        )
    );
    const innerBorders = $derived(
        topojson.feature(
            canadaTopo,
            canadaTopo.objects.innerborders
        )
    );

    let n = $state(7); // produces n+2 equal-population bands
    // Pre-compute quantile breakpoints. A floor threshold just below the
    // data minimum is prepended so that d3-contour generates a polygon for
    // the coldest region too (without it, areas below the first threshold
    // are left unfilled). The color scale domain uses only the quantile
    // breakpoints so the legend stays meaningful.
    const thresholds = $derived.by(() => {
        const sorted = weatherData
            .map((d) => d.Tx as number)
            .sort((a, b) => a - b);
        const quantiles = Array.from(
            { length: n + 1 },
            (_, i) =>
                quantileSorted(sorted, (i + 1) / (n + 2))
        );
        return [sorted[0] - 1e-6, ...quantiles];
    });
    const colorDomain = $derived(thresholds.slice(1));
</script>

<Slider bind:value={n} label="n" min={3} max={15} />
<Plot
    projection={{
        type: 'conic-conformal',
        domain: land,
        rotate: [96, 0],
        center: [0, 56],
        parallels: [49, 77]
    }}
    color={{
        scheme: 'burd',
        type: 'threshold',
        domain: colorDomain,
        legend: true
    }}>
    <defs>
        <clipPath id="canada-land-q">
            <Geo data={[land]} />
        </clipPath>
    </defs>
    <Contour
        data={weatherData}
        x="Long"
        y="Lat"
        value="Tx"
        fill="value"
        stroke="none"
        interpolate="random-walk"
        blur={2}
        clipPath="url(#canada-land-q)"
        {thresholds} />
    <Geo data={[land]} stroke="currentColor" fill={null} />
    <Geo
        data={[innerBorders]}
        stroke="currentColor"
        strokeOpacity={0.3}
        fill={null} />
</Plot>
```

[Example](/examples/contour/quantile)
