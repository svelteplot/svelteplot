---
title: Hexbin transform
---

The **hexbin** transform bins scatter data into hexagonal cells and aggregates values per cell using reducers. It is the 2D hexagonal equivalent of the [bin](/transforms/bin) transform.

```svelte live
<script>
    import { Plot, Hexgrid, Dot, hexbin } from 'svelteplot';
    import { page } from '$app/state';

    const { penguins } = $derived(page.data.data);
</script>

<Plot
    grid
    color={{ scheme: 'ylGnBu' }}
    testid="hexbin-basic">
    <Hexgrid binWidth={14} strokeOpacity={0.05} />
    <Dot
        {...hexbin(
            {
                data: penguins,
                x: 'culmen_length_mm',
                y: 'culmen_depth_mm'
            },
            { fill: 'count', r: 'count', bins: 15 }
        )}
        symbol="hexagon" />
</Plot>
```

The hexbin transform takes the same `{data, x, y, ...channels}` input as other transforms and returns a new dataset where each record is a hex cell center with aggregated output channels.

## Options

| Option     | Default | Description                                             |
| ---------- | ------- | ------------------------------------------------------- |
| `bins`     | `20`    | Approximate number of hex bins along the x-axis         |
| `binWidth` | —       | Explicit bin width in data units (overrides `bins`)     |
| `fill`     | —       | Reducer for the fill channel (e.g. `"count"`, `"mean"`) |
| `stroke`   | —       | Reducer for the stroke channel                          |
| `r`        | —       | Reducer for the radius channel                          |
| `opacity`  | —       | Reducer for the opacity channel                         |

## Usage

The transform is spread onto a mark (typically `Dot` with `symbol="hexagon"`):

```svelte
<Dot
    {...hexbin(
        { data, x: 'weight', y: 'height' },
        { fill: 'count', bins: 20 }
    )}
    symbol="hexagon" />
```

## Count heatmap

Map the count of points per cell to both fill color and radius:

```svelte live
<script>
    import { Plot, Hexgrid, Dot, hexbin } from 'svelteplot';
    import { page } from '$app/state';

    const { penguins } = $derived(page.data.data);
</script>

<Plot
    grid
    color={{ scheme: 'warm' }}
    r={{ range: [2, 12] }}
    testid="hexbin-heatmap">
    <Hexgrid binWidth={18} strokeOpacity={0.05} />
    <Dot
        {...hexbin(
            {
                data: penguins,
                x: 'culmen_length_mm',
                y: 'culmen_depth_mm'
            },
            { fill: 'count', r: 'count', bins: 12 }
        )}
        symbol="hexagon" />
</Plot>
```
