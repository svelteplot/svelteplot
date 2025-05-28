---
title: Difference mark
---

The **difference mark** can be used to fill the areas between a _metric_ line and a _comparison_ line/value colored based whether or not the difference is positive or negative.

The following example shows trade between the USA and the UK, with the exports from US to UK shown in <span style="border-bottom: solid 2px var(--svp-blue);">blue</span> and imports shown in <span style="border-bottom: solid 2px var(--svp-red);">red</span>. For the difference mark, exports are used as _metric_ (y2) and imports are used as _comparison_ (y1).

```svelte live
<script>
    import { Plot, Line, DifferenceY } from 'svelteplot';
    import { page } from '$app/state';
    let { trade } = $derived(page.data.data);
</script>

<Plot grid>
    <DifferenceY
        data={trade}
        x="Year"
        y1="Imports"
        y2="Exports"
        curve="basis"
        opacity="0.3"
        positiveFill="var(--svp-blue)"
        negativeFill="var(--svp-red)" />
    <Line
        data={trade}
        x="Year"
        y="Imports"
        stroke="var(--svp-red)"
        curve="basis" />
    <Line
        data={trade}
        x="Year"
        y="Exports"
        stroke="var(--svp-blue)"
        curve="basis" />
</Plot>
```

```svelte
<Plot grid>
    <DifferenceY
        data={trade}
        x="Year"
        y1="Imports"
        y2="Exports"
        curve="basis"
        opacity="0.3"
        positiveFill="blue"
        negativeFill="red" />
    <Line
        data={trade}
        x="Year"
        y="Imports"
        stroke="red"
        curve="basis" />
    <Line
        data={trade}
        x="Year"
        y="Exports"
        stroke="blue"
        curve="basis" />
</Plot>
```

If just one _x_ and _y_ channel is defined, the value zero will be used as comparison instead, and the _y_ channel will be used as fallback for the metric _y2_.

```svelte live
<script>
    import {
        Plot,
        Line,
        DifferenceY,
        RuleY
    } from 'svelteplot';
    import { page } from '$app/state';
    let { gistemp } = $derived(page.data.data);
</script>

<Plot height={350} y={{ grid: true }}>
    <DifferenceY
        data={gistemp}
        x="Date"
        y="Anomaly"
        curve="step"
        positiveFill="var(--svp-red)"
        negativeFill="var(--svp-blue)" />
    <RuleY data={[0]} />
</Plot>
```

```svelte
<Plot height={350} y={{ grid: true }}>
    <DifferenceY
        data={gistemp}
        x="Date"
        y="Anomaly"
        curve="step"
        positiveFill="var(--svp-red)"
        negativeFill="var(--svp-blue)" />
    <RuleY data={[0]} />
</Plot>
```

You can compare the metric to a different "baseline" by providing a constant _y1_ channel

```svelte live
<script>
    import {
        Plot,
        Line,
        DifferenceY,
        RuleY
    } from 'svelteplot';
    import { page } from '$app/state';
    let { gistemp } = $derived(page.data.data);
    import { Slider } from '$lib/ui';
    let y1 = $state(0.2);
</script>

<Slider
    label="y1"
    min={-0.4}
    max={1}
    step={0.01}
    bind:value={y1} />
<Plot height={350} y={{ grid: true }}>
    <DifferenceY
        data={gistemp}
        x="Date"
        y="Anomaly"
        {y1}
        curve="step"
        positiveFill="var(--svp-red)"
        negativeFill="var(--svp-blue)" />
    <RuleY data={[y1]} />
</Plot>
```

```svelte
<Plot height={350} y={{ grid: true }}>
    <DifferenceY
        data={gistemp}
        x="Date"
        y="Anomaly"
        {y1}
        curve="step"
        positiveFill="red"
        negativeFill="blue" />
    <RuleY data={[y1]} />
</Plot>
```

In combination with the [shift transform](/transforms/shift) you can compare a series to itself. The chart below shows year-over-year growth in the price of Apple stock.

```svelte live
<script>
    import {
        Plot,
        Line,
        DifferenceY,
        shiftX,
        RuleX
    } from 'svelteplot';
    import { page } from '$app/state';
    import { Slider } from '$lib/ui';

    let { aapl } = $derived(page.data.data);
    let days = $state(100);
</script>

<Slider label="days" min={0} max={700} bind:value={days} />
<Plot height={350} grid>
    <DifferenceY
        stroke
        {...shiftX(
            { data: aapl, x: 'Date', y: 'Close' },
            { x1: `+${days} days` }
        )}
        positiveFill="var(--svp-green)"
        negativeFill="var(--svp-red)" />
</Plot>
```

```svelte
<Plot height={350} grid>
    <DifferenceY
        stroke
        {...shiftX(
            { data: aapl, x: 'Date', y: 'Close' },
            { x1: `+${days} days` }
        )}
        positiveFill="green"
        negativeFill="red" />
</Plot>
```

## Difference options

At the very least, you need to provide an x2 and y2 channel for the _metric_ line.

- **x2** (or _x_) - the horizontal position of the metric line, bound to the x scale
- **y2** (or _y_) - the vertical position of the metric line, bound to the x scale

The following optional channels are supported:

- **x1** - the horizontal position of the comparison; bound to the x scale
- **y1** - the vertical position of the comparison; bound to the x scale
- positiveFill
- negativeFill

If **x1** is not specified, it defaults to **x2**. If **y1** is not specified, it defaults to 0 if **x1** and **x2** are equal, and to **y2** otherwise. These defaults facilitate sharing _x_ or _y_ coordinates between the metric and its comparison.

The standard fill option is ignored; instead, there are separate channels based on the sign of the difference:

- **positiveFill** - the color for when the metric is greater, defaults to green
- **negativeFill** - the color for when the comparison is greater, defaults to blue
- **fillOpacity** - the areas’ opacity, defaults to 1
- **positiveFillOpacity** - the positive area’s opacity, defaults to opacity
- **negativeFillOpacity** - the negative area’s opacity, defaults to opacity
- **stroke** - the metric line’s stroke color, defaults to currentColor
- **strokeOpacity** - the metric line’s opacity, defaults to 1

## DifferenceY
