---
title: Hexbin mark
---

The **Hexbin** mark bins 2D scatter data into a pixel-space hex lattice and renders each non-empty bin as a regular hexagonal cell. Unlike the [hexbin transform](/transforms/hexbin), the lattice is computed in pixel space (after scales exist), so cells are regular hexagons by construction regardless of axis aspect ratio.

```svelte live
<script>
    import { Plot, Hexbin } from 'svelteplot';
    import { page } from '$app/state';

    const { olympians } = $derived(page.data.data);
</script>

<Plot
    grid
    color={{ scheme: 'ylGnBu' }}
    testid="hexbin-mark-basic">
    <Hexbin
        data={olympians}
        x="weight"
        y="height"
        fill="count" />
</Plot>
```

## Pairing with Hexgrid

The data-less [Hexgrid](/marks/hexgrid) mark draws a hex backdrop. Both marks default to `binWidth: 20` (px), so an unconfigured pair aligns by convention without coordination.

```svelte live
<script>
    import { Plot, Hexbin, Hexgrid } from 'svelteplot';
    import { page } from '$app/state';

    const { olympians } = $derived(page.data.data);
</script>

<Plot
    grid
    color={{ scheme: 'ylGnBu' }}
    testid="hexbin-mark-with-grid">
    <Hexbin
        data={olympians}
        x="weight"
        y="height"
        fill="count" />
    <Hexgrid />
</Plot>
```

## Custom binWidth

Increase the cell size for fewer, larger bins:

```svelte live
<script>
    import { Plot, Hexbin, Hexgrid } from 'svelteplot';
    import { page } from '$app/state';

    const { olympians } = $derived(page.data.data);
</script>

<Plot
    grid
    color={{ scheme: 'warm' }}
    testid="hexbin-mark-binwidth">
    <Hexgrid binWidth={32} />
    <Hexbin
        data={olympians}
        x="weight"
        y="height"
        fill="count"
        binWidth={32} />
</Plot>
```

## Options

| Option        | Default   | Description                                                                |
| ------------- | --------- | -------------------------------------------------------------------------- |
| `data`        | —         | Input data (array of records with x/y)                                     |
| `x`, `y`      | —         | Position channels (data space)                                             |
| `binWidth`    | `20`      | Hex cell pitch in **pixels** (matches `<Hexgrid />`)                       |
| `fill`        | `'count'` | Reducer name (`'count'`, `'mean'`, …) → color scale, or a CSS color string |
| `stroke`      | `'none'`  | Same shape as `fill`                                                       |
| `strokeWidth` | —         | Cell outline width                                                         |
| `fillOpacity` | —         | Cell fill opacity                                                          |
