---
title: Grid mark
---

The Grid mark renders the faint grid lines in the background of your plots (the black tick lines and tick labels are rendered by the [Axis](/marks/axis) marks). You can let SveltePlot add the grids automatically for you by setting the `grid` flag on the Plot:

```svelte live
<script lang="ts">
    import { Plot, Line } from '$lib/index.js';

    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot grid testid="grid">
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

```svelte
<Plot grid>
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

You can turn the grids on individually by adding `grid: true` to the x and y
scale options:

```svelte
<Plot x={{ grid: true }} />
<Plot y={{ grid: true }} />
```

Or you can add the **GridX** and **GridY** marks explicitly for more options, such as
layering grids on top of other marks. Note that in this case, custom grid ticks are not synchronized
with the axes marks.

```svelte live
<script lang="ts">
    import { Plot, GridX, GridY } from '$lib/index.js';
</script>

<Plot
    x={{ domain: [0, 5] }}
    y={{ domain: [0, 5] }}
    testid="custom">
    <GridX stroke="lime" strokeOpacity="1" />
    <GridY
        stroke="magenta"
        strokeOpacity="1"
        data={[0, 1.5, 2, 2.5, 4, 5]} />
</Plot>
```

```svelte
<Plot x={{ domain: [0, 5] }} testid="custom">
    <GridX stroke="lime" />
    <GridY
        stroke="magenta"
        ticks={[0, 1.5, 2, 2.5, 4, 5]} />
</Plot>
```

In the following bar chart, we put two grids, one below the bars and one above:

```svelte live
<script>
    import { Plot, BarX, RuleX, GridX } from 'svelteplot';
</script>

<Plot marginTop={0}>
    <GridX />
    <BarX data={[1.5, 2.5, 4.5, 4.7, 6.2, 6.8]} />
    <GridX
        stroke="var(--svelteplot-bg)"
        strokeOpacity={0.4} />
    <RuleX data={[0]} />
</Plot>
```

```svelte
<Plot marginTop={0}>
    <GridX />
    <BarX data={[1.5, 2.5, 4.5, 4.7, 6.2, 6.8]} />
    <GridX
        stroke="var(--svelteplot-bg)"
        strokeOpacity={0.4} />
    <RuleX data={[0]} />
</Plot>
```

You can use the **x1**, **x2**, **y1**, and **y2** options to limit the grid lines to a specific range:

```svelte live
<script>
    import { Plot, Line, GridY } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot>
    <GridY
        x1={aapl[0].Date}
        x2={(value) =>
            aapl.find((d) => Math.abs(d.Close - value) < 1)
                ?.Date} />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

```svelte
<Plot>
    <GridY
        x1={aapl[0].Date}
        x2={(value) =>
            aapl.find((d) => Math.abs(d.Close - value) < 1)
                ?.Date} />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

The automatic ticks can be customized using the **tickSpacing** option:

```svelte
<Plot
    grid
    x={{ tickSpacing: 150 }}
    y={{ tickSpacing: 10 }}
    testid="tickspacing">
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

## Grid options

You can set grid options either through the global scale options or by passing them to the Grid marks directly. The global scale options have the benefit that they will affect both the grid and axis marks at the same time for neatly synchronized ticks and grid lines.

These are the options you can set as scale options on the `x` and `y` scales:

- **grid** - for activating the implicit grid just on the x or y dimension
- **tickSpacing** -
- **ticks** - for passing custom ticks

If you explicitly add a grid mark to your plot, you can set the following options on the mark component itself:

- **data** - custom ticks
-

## GridX

[API Reference](/api/marks#GridX)

For showing vertical grid lines spread along the x axis.

## GridY

[API Reference](/api/marks#GridY)

For showing horizontal grid lines spread along the x axis.
