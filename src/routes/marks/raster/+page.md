---
title: Raster mark
---

:::info
added in 0.12.0
:::

[API Reference](/api/marks#Raster)

The **raster mark** renders data as an [SVG image](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/image), mapping values through the color scale onto a pixel grid. It supports three distinct modes depending on how data is supplied:

- **Dense grid** — `data` is a flat row-major array of values with explicit `width` and `height`; each element is one pixel.
- **Scatter interpolation** — `data` is an array of records with `x`/`y` channels; values are spatially interpolated over the grid.
- **Function sampling** — `fill` is an `(x, y) => value` function; the mark evaluates it at each pixel in data coordinates.

## Dense grid mode

When `data` is a flat row-major array and both `width` and `height` are set (without `x`/`y` channels), the mark treats each element as a fill value at the corresponding grid position. Row 0 maps to the bottom of the plot (y = 0) so that data coordinates match the usual y-up convention.

:::info
Some examples on this page are based on the [Observable Plot raster mark documentation](https://observablehq.com/plot/marks/raster).
:::

The volcano example below uses an 87 × 61 elevation grid of [Maungawhau (Mt. Eden)](https://en.wikipedia.org/wiki/Maungawhau_/_Mount_Eden) in Auckland, NZ. The data is a plain object with `width`, `height`, and a flat `values` array of elevation numbers in row-major order:

```svelte
<script>
    import { Plot, Raster } from 'svelteplot';

    const volcano = {
        width: 87,
        height: 61,
        values: [103, 104, 104, 105, 105, 106 /* ... */]
    };
</script>

<Plot color={{ scheme: 'turbo', legend: true }}>
    <Raster
        data={volcano.values}
        width={volcano.width}
        height={volcano.height} />
</Plot>
```

```svelte live
<script lang="ts">
    import { Plot, Raster } from 'svelteplot';
    import { page } from '$app/state';

    const { volcano } = $derived(page.data.data);
</script>

<Plot color={{ scheme: 'turbo', legend: true }}>
    <Raster
        data={volcano.values}
        width={volcano.width}
        height={volcano.height} />
</Plot>
```

By default, the image is stretched to fill the plot using smooth interpolation. Set `imageRendering="pixelated"` to keep crisp pixel edges — useful when you want to show individual grid cells. You can also overlay other marks, such as `Text`, to label each cell:

```svelte live
<script lang="ts">
    import { Plot, Raster, Text } from 'svelteplot';
    import { range } from 'd3-array';

    const width = 10;
    const height = 10;
    const values = range(width).flatMap((x) =>
        range(height).map((y) => x * y)
    );
</script>

<Plot
    x={{ domain: [0, width] }}
    y={{ domain: [0, height] }}
    color={{ scheme: 'turbo' }}>
    <Raster
        data={values}
        {width}
        {height}
        imageRendering="pixelated" />
    <Text
        data={values}
        fill="white"
        fontSize={10}
        text={(d) => String(d)}
        x={(d, i) => (i % width) + 0.5}
        y={(d, i) => Math.floor(i / width) + 0.5} />
</Plot>
```

[Example](/examples/raster/simple)

You can also supply a `fill` accessor to extract a numeric value from each element when `data` holds objects rather than raw numbers.

## Scatter interpolation

Sometimes your data does not come in a gridded format, but at irregularly distributed x/y positions. This example uses weather station measurements across Canada. To show where the original observations were taken, start with the raw points:

```svelte live
<script lang="ts">
    import { Plot, Dot, Geo } from 'svelteplot';
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
</script>

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
        type: 'quantile',
        legend: true
    }}>
    <Dot data={weatherData} x="Long" y="Lat" fill="Tx" />
    <Geo data={[land]} stroke="currentColor" fill={null} />
</Plot>
```

[Example](/examples/dot/weather)

The raster mark automatically interpolates a grid when `x` and `y` are provided.

Four interpolation strategies are available:

- **none** — each data point is mapped to its nearest pixel; no interpolation between points.
- **nearest** — Voronoi nearest-neighbor: every pixel takes the value of the closest data point.
- **barycentric** — Delaunay triangulation with barycentric interpolation inside triangles; smooth but can produce artifacts near the convex hull.
- **random-walk** — walk-on-spheres algorithm; produces smooth, visually pleasing results similar to a [Laplacian field](https://en.wikipedia.org/wiki/Laplace%27s_equation). Recommended for most use cases.

```svelte live
<script lang="ts">
    import { Plot, Raster, Geo } from 'svelteplot';
    import { page } from '$app/state';
    import { Select } from '$shared/ui';
    import * as topojson from 'topojson-client';

    const { weather, canadaTopo } = $derived(
        page.data.data
    );
    const INTERPOLATIONS = [
        'none',
        'nearest',
        'barycentric',
        'random-walk'
    ];
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
    let interpolate = $state('random-walk');
</script>

<div style="margin-bottom:1em">
    <Select
        label="interpolate"
        options={INTERPOLATIONS}
        bind:value={interpolate} />
</div>

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
        type: 'quantile'
    }}>
    <Raster
        data={weatherData}
        x="Long"
        y="Lat"
        fill="Tx"
        {interpolate} />
    <Geo data={[land]} stroke="currentColor" fill={null} />
</Plot>
```

```svelte
<Plot
    projection={{
        type: 'conic-conformal',
        domain: land
    }}
    color={{
        scheme: 'burd',
        type: 'quantile'
    }}>
    <Raster
        data={weatherData}
        x="Long"
        y="Lat"
        fill="Tx"
        interpolate="random-walk" />
    <!-- outline -->
    <Geo data={[land]} stroke="currentColor" fill={null} />
</Plot>
```

Clipping the raster to the land geometry removes those values outside the coastline while keeping the same interpolation:

```svelte live
<script lang="ts">
    import { Plot, Raster, Geo } from 'svelteplot';
    import { page } from '$app/state';
    import { Select } from '$shared/ui';
    import * as topojson from 'topojson-client';

    const { weather, canadaTopo } = $derived(
        page.data.data
    );
    const INTERPOLATIONS = [
        'none',
        'nearest',
        'barycentric',
        'random-walk'
    ];
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
    let interpolate = $state('random-walk');
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
        type: 'quantile'
    }}>
    <defs>
        <clipPath id="canada-land">
            <Geo data={[land]} />
        </clipPath>
    </defs>
    <Raster
        data={weatherData}
        x="Long"
        y="Lat"
        fill="Tx"
        {interpolate}
        clipPath="url(#canada-land)" />
    <Geo data={[land]} stroke="currentColor" fill={null} />
    <Geo
        data={[innerBorders]}
        stroke="white"
        opacity={0.5} />
</Plot>
```

```svelte
<Plot /* ... */>
    <defs>
        <clipPath id="canada-land">
            <Geo data={[land]} />
        </clipPath>
    </defs>
    <Raster
        data={weatherData}
        x="Long"
        y="Lat"
        fill="Tx"
        interpolate="random-walk"
        clipPath="url(#canada-land)" />
    <Geo data={[land]} stroke="currentColor" fill={null} />
    <Geo
        data={[innerBorders]}
        stroke="white"
        opacity={0.5} />
</Plot>
```

:::caution
For real weather analysis, temperature is often interpolated with more sophisticated methods that [account for elevation](https://www.vis4.net/blog/2023/12/spatiotemporal-data-analysis-pitfalls/#pitfall-4-choosing-the-wrong-interpolation-method), since air temperature is strongly correlated with altitude between stations.
:::

The `blur` option applies a Gaussian blur (in grid pixels) after rasterization. With sparse station data it smooths out interpolation artifacts and creates a more continuous field:

```svelte live
<script lang="ts">
    import { Plot, Raster, Geo } from 'svelteplot';
    import { page } from '$app/state';
    import { Slider } from '$shared/ui';
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
    let blur = $state(2);
</script>

<Slider
    label="blur"
    bind:value={blur}
    min={0}
    max={10}
    step={1} />

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
        type: 'quantile'
    }}>
    <defs>
        <clipPath id="canada-land-blur">
            <Geo data={[land]} />
        </clipPath>
    </defs>
    <Raster
        data={weatherData}
        x="Long"
        y="Lat"
        fill="Tx"
        interpolate="random-walk"
        {blur}
        clipPath="url(#canada-land-blur)" />
    <Geo data={[land]} stroke="currentColor" fill={null} />
    <Geo
        data={[innerBorders]}
        stroke="white"
        opacity={0.5} />
</Plot>
```

[Example](/examples/raster/geo-raster)

## Function sampling

When no `data` is provided and `fill` is a function, the raster mark evaluates it at each pixel. The function receives data-space coordinates derived by inverting the x and y scales, so you can directly express any mathematical or geographic field.

The `x1`, `y1`, `x2`, `y2` props define the data-space bounding box. The example below renders the [Mandelbrot set](https://en.wikipedia.org/wiki/Mandelbrot_set) by counting escape iterations:

```svelte live
<script lang="ts">
    import { Plot, Raster } from 'svelteplot';
    import { Slider } from '$shared/ui';

    function mandelbrot(x: number, y: number) {
        for (let n = 0, zr = 0, zi = 0; n < 80; ++n) {
            [zr, zi] = [
                zr * zr - zi * zi + x,
                2 * zr * zi + y
            ];
            if (zr * zr + zi * zi > 4) return n;
        }
    }

    let pixelSize = $state(1);
</script>

<Slider
    label="pixelSize"
    bind:value={pixelSize}
    min={1}
    max={10}
    step={1} />
<Plot
    color={{ scheme: 'turbo', domain: [0, 80] }}
    aspectRatio={1}>
    <Raster
        {pixelSize}
        imageRendering="pixelated"
        fill={mandelbrot}
        x1={-2}
        x2={1}
        y1={-1.164}
        y2={1.164} />
</Plot>
```

```svelte
<Plot
    color={{ scheme: 'turbo', domain: [0, 80] }}
    aspectRatio={1}>
    <Raster
        fill={mandelbrot}
        x1={-2}
        x2={1}
        y1={-1.164}
        y2={1.164} />
</Plot>
```

:::tip
You can find more examples in the [raster mark examples](/examples/raster).
:::

## Channels and options

**Channels** (mapped through scales):

- **fill** — the color value; a field name, accessor `(d) => value`, or `(x, y) => value` function for sampling mode.
- **fillOpacity** — per-pixel opacity; a field name, accessor, or `(x, y) => number` function.
- **x**, **y** — position channels for scatter interpolation mode.

**Spatial bounds** (data coordinates):

- **x1**, **y1**, **x2**, **y2** — explicit bounding box; required for function sampling mode to define the data-space extent. In dense grid and scatter modes the bounds default to the x/y scale domain.

**Grid resolution**:

- **width**, **height** — explicit pixel-grid dimensions. Required for dense grid mode. In other modes these override `pixelSize` to set a fixed resolution.
- **pixelSize** — size of each grid pixel in screen pixels (default `1`). Increase to reduce resolution. Ignored when `width`/`height` are set.

**Rendering**:

- **interpolate** — spatial interpolation method for scatter mode: `"none"`, `"nearest"`, `"barycentric"`, `"random-walk"`, or a custom `(index, w, h, X, Y, V) => W` function. Default: `"none"`.
- **blur** — Gaussian blur radius in grid pixels applied after rasterization (default `0`).
- **imageRendering** — CSS `image-rendering` property on the `<image>` element (default `"auto"`). Use `"pixelated"` for crisp pixel edges.
