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

The volcano example below uses an 87 × 61 elevation grid of [Maungawhau (Mt. Eden)](https://en.wikipedia.org/wiki/Maungawhau_/_Mount_Eden) in Auckland, NZ. The data is a plain object with `width`, `height`, and a flat `values` array of elevation numbers in row-major order:

```svelte
<script>
  import { Plot, Raster } from 'svelteplot';
  
  const volcano = {
    width: 87,
    height: 61,
    values: [103, 104, 104, 105, 105, 106, ...]
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

When `data` has `x` and `y` channels, the raster mark spatially interpolates the scattered point values over the pixel grid. This is useful for irregularly sampled field data such as survey measurements.

The example below shows magnetic anomaly measurements from California survey CA55, interpolated over a geographic grid:

```svelte live
<script lang="ts">
    import { Plot, Raster } from 'svelteplot';
    import { RadioInput } from '$shared/ui';
    import { page } from '$app/state';

    const { ca55 } = $derived(page.data.data);
    let interpolate = $state('random-walk');
</script>

<RadioInput
    bind:value={interpolate}
    options={[
        'none',
        'nearest',
        'barycentric',
        'random-walk'
    ]} />

<Plot color={{ type: 'diverging', legend: true }}>
    <Raster
        data={ca55}
        x="LONGITUDE"
        y="LATITUDE"
        fill="MAG_IGRF90"
        {interpolate}
        blur={5} />
</Plot>
```

```svelte
<Plot color={{ type: 'diverging', legend: true }}>
    <Raster
        data={ca55}
        x="LONGITUDE"
        y="LATITUDE"
        fill="MAG_IGRF90"
        interpolate="random-walk"
        blur={5} />
</Plot>
```

Four interpolation strategies are available:

- **`none`** — each data point is mapped to its nearest pixel; no interpolation between points.
- **`nearest`** — Voronoi nearest-neighbor: every pixel takes the value of the closest data point.
- **`barycentric`** — Delaunay triangulation with barycentric interpolation inside triangles; smooth but can produce artifacts near the convex hull.
- **`random-walk`** — walk-on-spheres algorithm; produces smooth, visually pleasing results similar to a [Laplacian field](https://en.wikipedia.org/wiki/Laplace%27s_equation). Recommended for most use cases.

## Blur

The `blur` option applies a Gaussian blur (in grid pixels) after rasterization. It is especially effective with sparse scatter data to smooth out interpolation artifacts:

```svelte live
<script lang="ts">
    import { Plot, Raster } from 'svelteplot';
    import { Slider } from '$shared/ui';
    import { page } from '$app/state';

    const { ca55 } = $derived(page.data.data);
    let blur = $state(5);
</script>

<Slider
    label="blur"
    bind:value={blur}
    min={0}
    max={20}
    step={1} />

<Plot color={{ type: 'diverging', legend: true }}>
    <Raster
        data={ca55}
        x="LONGITUDE"
        y="LATITUDE"
        fill="MAG_IGRF90"
        interpolate="random-walk"
        {blur} />
</Plot>
```

## Function sampling

When no `data` is provided and `fill` is a function, the raster mark evaluates it at each pixel. The function receives data-space coordinates derived by inverting the x and y scales, so you can directly express any mathematical or geographic field.

The `x1`, `y1`, `x2`, `y2` props define the data-space bounding box. The example below renders the [Mandelbrot set](https://en.wikipedia.org/wiki/Mandelbrot_set) by counting escape iterations:

```svelte live
<script lang="ts">
    import { Plot, Raster } from 'svelteplot';

    function mandelbrot(x: number, y: number) {
        for (let n = 0, zr = 0, zi = 0; n < 80; ++n) {
            [zr, zi] = [
                zr * zr - zi * zi + x,
                2 * zr * zi + y
            ];
            if (zr * zr + zi * zi > 4) return n;
        }
    }
</script>

<Plot color={{ scheme: 'turbo', domain: [0, 80] }}>
    <Raster
        fill={mandelbrot}
        x1={-2}
        x2={1}
        y1={-1.164}
        y2={1.164} />
</Plot>
```

```svelte
<Plot color={{ scheme: 'turbo', domain: [0, 80] }}>
    <Raster
        fill={mandelbrot}
        x1={-2}
        x2={1}
        y1={-1.164}
        y2={1.164} />
</Plot>
```

By default the raster fills the entire plot at one pixel per screen pixel. You can increase `pixelSize` to reduce resolution and improve performance:

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

    let pixelSize = $state(2);
</script>

<Slider
    label="pixelSize"
    bind:value={pixelSize}
    min={1}
    max={10}
    step={1} />

<Plot color={{ scheme: 'turbo', domain: [0, 80] }}>
    <Raster
        fill={mandelbrot}
        x1={-2}
        x2={1}
        y1={-1.164}
        y2={1.164}
        {pixelSize} />
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
