---
title: Normalize transform
---

Useful for normalizing data series of different measurement units or varying magnitude such as stock prices of different companies.

```svelte live
<script>
    import { Plot, Line, normalizeY } from 'svelteplot';
    import { Select } from '$lib/ui';
    import { page } from '$app/state';
    let { tech7 } = $derived(page.data.data);

    let basis = $state('first');
</script>

<Select
    bind:value={basis}
    label="Basis"
    options={[
        'first',
        'last',
        'min',
        'max',
        'mean',
        'median',
        'sum',
        'deviation',
        'extent'
    ]} />
<Plot y={{ grid: true }}>
    <Line
        {...normalizeY(
            {
                data: tech7,
                x: 'date',
                y: 'adj_close',
                stroke: 'symbol',
                curve: 'monotone-x'
            },
            basis
        )} />
</Plot>
```

```svelte
<Plot y={{ grid: true }}>
    <Line
        {...normalizeY(
            {
                data: tech7,
                x: 'date',
                y: 'adj_close',
                stroke: 'symbol'
            },
            'first'
        )} />
</Plot>
```

:::tip
👀 You find more examples using the normalize transform in the [examples section](/examples/normalize).
:::

## Options

The normalize transform supports the following named basis options:

- `first` - Normalizes based on the first value in the series.
- `last` - Normalizes based on the last value in the series.
- `min` - Normalizes based on the minimum value in the series.
- `max` - Normalizes based on the maximum value in the series.
- `mean` - Normalizes based on the mean (average) value in the series.
- `median` - Normalizes based on the median value in the series.
- `sum` - Normalizes based on the sum of all values in the series.
- `deviation` - Normalizes based on the standard deviation of the series.
- `extent` - Normalizes based on the range (max - min) of the series.

In addition to the named basis options you can define your own, e.g. to specify the exact date to index your data on:

```svelte live
<script>
    import { Plot, Line, normalizeY } from 'svelteplot';
    import { Slider } from '$lib/ui';
    import { page } from '$app/state';
    let { tech7 } = $derived(page.data.data);

    let i = $state(30);
</script>

<Slider label="index" min={0} max={60} bind:value={i} />
<Plot y={{ grid: true }}>
    <Line
        {...normalizeY(
            {
                data: tech7,
                x: 'date',
                y: 'adj_close',
                stroke: 'symbol',
                curve: 'monotone-x'
            },
            (I, S) => S[i]
        )} />
</Plot>
```

```svelte
<Plot y={{ grid: true }}>
    <Line
        {...normalizeY(
            {
                data: tech7,
                x: 'date',
                y: 'adj_close',
                stroke: 'symbol',
                curve: 'monotone-x'
            },
            (I, S) => S[30]
        )} />
</Plot>
```

## normalizeY

[API Reference](/api/transforms#normalizeY)

Normalizes the y-values of a data series based on a specified basis.

## normalizeX

[API Reference](/api/transforms#normalizeX)

Normalizes the x-values of a data series based on a specified basis.

## normalizeParallelY

:::info
added in 0.7.1
:::

[API Reference](/api/transforms#normalizeParallelY)

A specialized normalizeY that normalizes multiple y-value series indepenently for each x-value. Under the hood this is just the `normalizeY` and `sort` transforms [combined](https://github.com/svelteplot/svelteplot/blob/main/src/lib/transforms/normalize.ts#L116-L132).

```svelte live
<script lang="ts">
    import {
        Plot,
        Line,
        normalizeParallelY
    } from 'svelteplot';

    import { page } from '$app/state';
    let { iris2 } = $derived(page.data.data);
</script>

<Plot
    grid
    y={{ label: 'Standard deviation' }}
    color={{ legend: true }}>
    <Line
        {...normalizeParallelY(
            {
                data: iris2,
                x: 'Measurement',
                y: 'Value',
                z: 'Id'
            },
            'deviation'
        )}
        strokeOpacity={0.5}
        stroke="Species"
        marker="dot" />
</Plot>
```

```svelte
<Plot grid color={{ legend: true }}>
    <Line
        {...normalizeParallelY(
            {
                data: iris,
                x: 'Measurement',
                y: 'Value',
                z: 'Id'
            },
            'deviation'
        )}
        strokeOpacity={0.5}
        stroke="Species" />
</Plot>
```

[fork](https://svelte.dev/playground/e328626124904a89a0ddbe8a3816a7af?version=5)

## normalizeParallelX

:::info
added in 0.7.1
:::

[API Reference](/api/transforms#normalizeParallelX)

A specialized normalizeX that normalizes multiple x-value series for each y-value.

```svelte live
<script lang="ts">
    import {
        Plot,
        Line,
        normalizeParallelX
    } from 'svelteplot';

    import { page } from '$app/state';
    let { iris2 } = $derived(page.data.data);
</script>

<Plot grid height={300} color={{ legend: true }}>
    <Line
        {...normalizeParallelX(
            {
                data: iris2,
                x: 'Value',
                y: 'Measurement',
                z: 'Id'
            },
            'extent'
        )}
        strokeOpacity={0.5}
        stroke="Species"
        marker="dot" />
</Plot>
```
