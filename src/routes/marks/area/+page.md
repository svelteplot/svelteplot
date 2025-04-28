---
title: Area mark
---

<script lang="ts">
    import Streamgraph from './Streamgraph.svelte';
</script>

The **area mark** draws the region between a baseline (x1, y1) and a topline (x2, y2) as in an area chart. Often the baseline represents y = 0, and because the area mark interpolates between adjacent data points, typically both the x and y scales are quantitative or temporal.

```svelte live
<script lang="ts">
    import { Plot, AreaY } from '$lib/index';
    import { page } from '$app/state';
    const { aapl } = $derived(page.data.data);
</script>

<Plot grid>
    <AreaY data={aapl} x="Date" y="Close" />
</Plot>
```

```svelte
<Plot grid>
    <AreaY data={aapl} x="Date" y="Close" />
</Plot>
```

[fork](https://svelte.dev/playground/0d3db990450f42bab5a0fe474d5d9cb2?version=5.28.2)

If you supply `undefined` values, the area mark will create gaps in the visualization at those points. This is useful when you want to represent missing or invalid data without interpolating across it.

```svelte live
<script lang="ts">
    import { Plot, AreaY } from '$lib/index';
    import { page } from '$app/state';
    const { aapl } = $derived(page.data.data);
</script>

<Plot grid height={250}>
    <AreaY
        data={[
            1.5,
            2,
            3.5,
            4,
            5.5,
            undefined,
            7,
            8.5,
            9
        ]} />
</Plot>
```

```svelte
<script>
    let data = [1.5, 2, 3.5, 4, 5.5, undefined, 7, 8.5, 9];
</script>

<Plot grid>
    <AreaY {data} />
</Plot>
```

In order to interpolate across undefined values you need to filter them, e.g. using the filter transform:

```svelte live
<script lang="ts">
    import { Plot, AreaY } from '$lib/index';
    import { page } from '$app/state';
    const { aapl } = $derived(page.data.data);
</script>

<Plot grid height={255}>
    <AreaY
        filter={(d) => d !== undefined}
        data={[
            1.5,
            2,
            3.5,
            4,
            5.5,
            undefined,
            7,
            8.5,
            9
        ]} />
</Plot>
```

```svelte
<script>
    let data = [1.5, 2, 3.5, 4, 5.5, undefined, 7, 8.5, 9];
</script>

<Plot grid>
    <AreaY {data} filter={(d) => d !== undefined} />
</Plot>
```

## AreaY

If you need a different baseline you can pass <b>y1</b> and <b>y2</b> channels instead of
<b>y</b> to disable the implicit stacking:

```svelte live
<script>
    import { Plot, AreaY } from '$lib/index';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot grid>
    <AreaY data={aapl} x="Date" y1={120} y2="Close" />
</Plot>
```

```svelte
<Plot grid>
    <AreaY data={aapl} x="Date" y1={120} y2="Close" />
</Plot>
```

Implicit stacking over y

Required channels:

- `x`
- either `y` for implicit stacking or `y1` and `y2` if you want to control the offsets directly

You can also just pass an array of numbers to <b>AreaY</b> for a quick plot:

```svelte live
<script>
    import { Plot, AreaY, RuleY } from '$lib';
    import { range } from 'd3-array';
</script>

<Plot
    testid="area-y-numbers"
    grid
    height={200}
    y={{ ticks: [-1, 0, 1] }}>
    <AreaY
        data={range(100).map((v) => Math.cos(v / 5))}
        opacity={0.5} />
    <RuleY data={[0]} />
</Plot>
```

```svelte
<Plot grid height={200} y={{ ticks: [-1, 0, 1] }}>
    <AreaY
        data={range(100).map((v) => Math.cos(v / 5))}
        opacity={0.5} />
    <RuleY data={[0]} />
</Plot>
```

To create a stacked area chart you can use the implicit [stackY](/transforms/stack) transform built into the AreaY mark:

```svelte live
<script>
    import { Plot, AreaY } from '$lib';
    import { page } from '$app/state';
    let { riaa } = $derived(page.data.data);
</script>

<Plot>
    <AreaY
        data={riaa}
        x="year"
        y="revenue"
        z="format"
        fill="group" />
</Plot>
```

```svelte
<Plot>
    <AreaY
        data={riaa}
        x="year"
        y="revenue"
        z="format"
        fill="group" />
</Plot>
```

You can control the stacking for the implicit [stackY](/transforms/stack) transform using the `stack` options:

- `order` - can be one of `none`, `appearance`, `inside-out`, or `sum`.
- `reverse` - for reversing the order
- `offset`

```svelte live
<script>
    import { Plot, AreaY } from '$lib';
    import { page } from '$app/state';
    import { Select } from '$lib/ui';
    let { riaa } = $derived(page.data.data);

    const CURVES =
        'basis,basis-open,bump-x,bump-y,bundle,cardinal,cardinal-open,catmull-rom,catmull-rom-open,catmull,linear,monotone-x,monotone-y,natural,step,step-after,step-before'.split(
            ','
        );
    let curve = $state('linear');

    let reverse = $state(false);
    let order = $state('none');
</script>

<Select label="curve" options={CURVES} bind:value={curve} />
<Select
    label="order"
    options={['none', 'appearance', 'inside-out', 'sum']}
    bind:value={order} />
<Plot>
    <AreaY
        data={riaa}
        x="year"
        y="revenue"
        z="format"
        fill="group"
        {curve}
        stack={{ order, reverse }} />
</Plot>
```

Streamgraph example:

```svelte live
<script>
    import { Plot, AreaY } from '$lib/index.js';
    import { Select } from '$lib/ui';
    import { page } from '$app/stores';
    const { riaa } = $derived($page.data.data);
    let offset = $state('wiggle');
</script>

<Select
    label="offset"
    bind:value={offset}
    options={['none', 'wiggle', 'center', 'normalize']} />

<Plot
    grid
    marginLeft={0}
    x={{ grid: true }}
    y={{ axis: false }}
    color={{ legend: true }}
    testid="area-y1">
    <AreaY
        data={riaa}
        x="year"
        y="revenue"
        z="format"
        curve="basis"
        fill="group"
        stack={{ offset }} />
</Plot>
```

## AreaX

For "vertical" area charts you can use the <b>AreaX</b> mark as shorthand

```svelte live
<script>
    import { Plot, AreaX } from '$lib';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot grid testid="area-x" height={600} maxWidth="300px">
    <AreaX data={aapl} y="Date" x="Close" />
</Plot>
```

## Area

The **Area** mark is useful for area charts. It pairs nicely with a <b>Line</b> mark for
the topline and a <b>RuleY</b> for the baseline:

Required channels for horizontal area charts:

- `x`, `y1`, and `y2` (for horizontal → area charts)
- `y`, `x1` and `x2` (for vertical area charts)
- `z` to group multiple areas

```svelte live
<script lang="ts">
    import {
        Plot,
        Frame,
        Area,
        AreaX,
        AreaY,
        Line,
        RuleY
    } from '$lib/index.js';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot grid testid="area-line-rule">
    <Area
        data={aapl}
        x1="Date"
        y1={0}
        y2="Close"
        opacity={0.25} />
    <Line data={aapl} x="Date" y="Close" />
    <RuleY data={[0]} />
</Plot>
```

```svelte
<Plot grid>
    <Area
        data={aapl}
        x1="Date"
        y1={0}
        y2="Close"
        opacity={0.25} />
    <Line data={aapl} x="Date" y="Close" />
    <RuleY data={[0]} />
</Plot>
```

Typically, you won't want to use the <b>Area</b> mark directly, but want to use <b>AreaY</b>
for "horizontal" area charts, where the time axis goes from left to right, or <b>AreaX</b> for "vertical" area charts.

The Area mark is useful when you need precise control over both baseline and topline positions along both axes. It accepts the following required channels:

- `x1`: The x-coordinate for the baseline
- `y1`: The y-coordinate for the baseline
- `x2`: The x-coordinate for the topline (for vertical areas)
- `y2`: The y-coordinate for the topline (for horizontal areas)

Additional options include:

- `z`: Group data into separate areas
- `fill`: Fill color for the area
- `stroke`: Stroke color for the area border
- `opacity`: Overall opacity
- `fillOpacity`: Opacity for just the fill
- `strokeOpacity`: Opacity for just the stroke
- `curve`: Curve type for interpolation between points
  (options: linear, basis, cardinal, step, etc.)

```svelte live
<script lang="ts">
    import { Plot, Area, Line } from '$lib/index.js';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);

    // Create a subset of lower value points
    const baseline = aapl.map((d) => ({
        date: d.Date,
        value: d.Close * 0.8
    }));
</script>

<Plot grid>
    <Area
        data={aapl}
        x1="Date"
        y1={(d) =>
            baseline.find((b) => +b.date === +d.Date)
                ?.value || 0}
        y2="Close"
        opacity={0.25}
        fill="steelblue" />
    <Line
        data={aapl}
        x="Date"
        y="Close"
        stroke="steelblue" />
    <Line
        data={baseline}
        x="date"
        y="value"
        stroke="steelblue"
        strokeOpacity={0.5}
        strokeDasharray="3,3" />
</Plot>
```

This example demonstrates using the Area mark to create a custom area chart with a dynamically calculated baseline, showing both the upper and lower bounds with lines.
