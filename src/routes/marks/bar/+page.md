---
title: Bar mark
---

<script>
    import BarPlot from './BarPlot.svelte';
    import StackedBarPlot from './StackedBarPlot.svelte';
</script>

Bars are useful to show quantitative data for different categories. They come in two flavors: [BarX](#BarX) for horizontal bars (y axis requires band scale) and [BarY](#BarY) for vertical bars aka. columns (x axis requires band scale).

```svelte live
<script>
    import { Plot, BarX, RuleX } from 'svelteplot';
    const data = [
        { year: 2019, value: 20 },
        { year: 2020, value: 24 },
        { year: 2021, value: 32 },
        { year: 2022, value: 39 },
        { year: 2024, value: 56 }
    ];
</script>

<Plot>
    <BarX {data} x="value" y="year" />
    <RuleX data={[0]} />
</Plot>
```

```svelte
<Plot>
    <BarX {data} x="value" y="year" />
    <RuleX data={[0]} />
</Plot>
```

[fork](https://svelte.dev/playground/7a0d38cf74be4a9985feb7bef0456008?version=5)

SveltePlot automatically infers a band scale for the y axis in the above example. but since our data is missing a value for 2023, the value `"2023"` is entirely missing from the band scale domain. We could fix this by passing the domain value manually, or by using the `interval` option of the y axis:

```svelte live
<script>
    import { Plot, BarX, RuleX } from 'svelteplot';
    const data = [
        { year: 2019, value: 20 },
        { year: 2020, value: 24 },
        { year: 2021, value: 32 },
        { year: 2022, value: 39 },
        { year: 2024, value: 56 }
    ];
</script>

<Plot y={{ interval: 1 }}>
    <BarX {data} x="value" y="year" />
    <RuleX data={[0]} />
</Plot>
```

```
<Plot y={{ interval: 1 }}>
    <BarX {data} x="value" y="year" />
    <RuleX data={[0]} />
</Plot>
```

You can create stacked bar charts by defining a fill channel which will be used for grouping the series by the implicit [stack transform](/transforms/stack). In the following example we're first grouping the penguins dataset by island to then stack them by species:

```svelte live
<script lang="ts">
    import { Plot, BarX, groupY, RuleX } from 'svelteplot';
    import { getContext } from 'svelte';

    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot
    x={{ axis: 'top' }}
    color={{ legend: true }}
    marginTop={40}>
    <RuleX data={[0]} />
    <BarX
        {...groupY(
            {
                data: penguins,
                y: 'island',
                fill: 'species'
            },
            { x: 'count' }
        )} />
</Plot>
```

```svelte
<Plot x={{ axis: 'top' }} color={{ legend: true }}>
    <RuleX data={[0]} />
    <BarX
        {...groupY(
            {
                data: penguins,
                y: 'island',
                fill: 'species'
            },
            { x: 'count' }
        )} />
</Plot>
```

[fork](https://svelte.dev/playground/6d334e103f9e444d99bb67c8af1335bc?version=5)

## BarX

The `BarX` component renders horizontal bars, typically used with a band scale on the y-axis. This is ideal for categorical data where the categories run along the y-axis, and the values extend horizontally.

**Properties**

- **data** - The data array to visualize
- **x** - Value accessor for the x channel (length of bar)
- **x1** - Start value accessor for the x channel
- **x2** - End value accessor for the x channel
- **y** - Value accessor for the y channel (position on the category axis)
- **stack** - Configuration for stacking the bars. See [stack transform](/transforms/stack)
- **borderRadius** - Border radius for the bar corners. Can be a single number for all corners or an object with separate values for topLeft, topRight, bottomRight, bottomLeft
- **inset** - Inset value for all sides of the bar
- **insetLeft** - Inset value for the left side of the bar
- **insetRight** - Inset value for the right side of the bar
- **insetTop** - Inset value for the top of the bar
- **insetBottom** - Inset value for the bottom of the bar

Additionally, `BarX` supports all common styling properties like `fill`, `stroke`, `opacity`, etc.

## BarY

The `BarY` component renders vertical bars (columns), typically used with a band scale on the x-axis. This is ideal for categorical data where the categories run along the x-axis, and the values extend vertically.

**Properties**

- **data** - The data array to visualize
- **x** - Value accessor for the x channel (position on the category axis)
- **y** - Value accessor for the y channel (height of bar)
- **y1** - Start value accessor for the y channel
- **y2** - End value accessor for the y channel
- **stack** - Configuration for stacking the bars. See [stack transform](/transforms/stack)
- **interval** - Converts y into y1/y2 ranges based on the provided interval. Disables implicit stacking
- **borderRadius** - Border radius for the bar corners. Can be a single number for all corners or an object with separate values for topLeft, topRight, bottomRight, bottomLeft
- **inset** - Inset value for all sides of the bar
- **insetLeft** - Inset value for the left side of the bar
- **insetRight** - Inset value for the right side of the bar
- **insetTop** - Inset value for the top of the bar
- **insetBottom** - Inset value for the bottom of the bar

Additionally, `BarY` supports all common styling properties like `fill`, `stroke`, `opacity`, etc.

```svelte live
<script>
    import { Plot, BarY, RuleY } from 'svelteplot';
    const data = [
        { year: 2019, value: 20 },
        { year: 2020, value: 24 },
        { year: 2021, value: 32 },
        { year: 2022, value: 39 },
        { year: 2024, value: 56 }
    ];
</script>

<Plot height={250}>
    <BarY {data} x="year" y="value" />
    <RuleY data={[0]} />
</Plot>
```

```svelte
<Plot>
    <BarY {data} x="year" y="value" />
    <RuleY data={[0]} />
</Plot>
```

[fork](https://svelte.dev/playground/8b9fb6c1946d4579a3dc9da32f6c983c?version=5)

## Insets

You can create bullet bars using the `inset` option and two `BarX` layers:

```svelte live
<script>
    import { Plot, BarX, RuleX } from 'svelteplot';
</script>

<Plot y={{ type: 'band' }} height={200} marginTop={0}>
    <BarX data={[2.3, 4, 5, 3.7, 5.4]} opacity={0.3} />
    <BarX data={[1, 2, 3, 4, 5]} inset={8} />
</Plot>
```

```svelte
<Plot y={{ type: 'band' }} height={200} marginTop={0}>
    <BarX data={[2.3, 4, 5, 3.7, 5.4]} opacity={0.3} />
    <BarX data={[1, 2, 3, 4, 5]} inset={8} />
</Plot>
```

[fork](https://svelte.dev/playground/d8170543f02c482ba64e82787d716e40?version=5)

Note that **inset** by default only applies along the band scale axis, but won't affect the "length" the bars. You can use insetLeft, insetRight, insetTop, and insetBottom directly, e.g. to add space in a stacked bar chart:

```svelte live
<script lang="ts">
    import { Plot, BarX, groupY, RuleX } from 'svelteplot';
    import { getContext } from 'svelte';

    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot x={{ axis: 'top' }}>
    <RuleX data={[0]} />
    <BarX
        {...groupY(
            {
                data: penguins,
                y: 'island',
                fill: 'species'
            },
            { x: 'count' }
        )}
        insetRight={1} />
</Plot>
```

```svelte
<BarX
    {...groupY(
        {
            data: penguins,
            y: 'island',
            fill: 'species'
        },
        { x: 'count' }
    )}
    insetRight={1} />
```

[fork](https://svelte.dev/playground/6f5f4ae882e24f5b81c60842c6250f31?version=5)

:::caution
Please be aware that by setting insets, you are slightly distorting the area of the bars.
:::

## Border radius

You can set a border radius for the bars either as number for all corners or as `{'{ topLeft, topRight, bottomRight, bottomLeft }'}` object to specify a border radius for individual corners:.

:::caution
Please be aware that by setting a border radius, you are slightly distorting the area of the bars.
:::

```svelte live
<script>
    import { Plot, BarX, RuleX } from 'svelteplot';
    import { Slider } from '$lib/ui';

    let radius = $state(10);
</script>

<Slider
    bind:value={radius}
    min={0}
    max={20}
    label="radius" />
<Plot x={{ axis: false }} y={{ type: 'band', axis: false }}>
    <BarX
        data={[1, 2, 3, 4, 5]}
        borderRadius={{
            topRight: radius,
            bottomRight: radius
        }} />
    <RuleX data={[0]} />
</Plot>
```

```svelte
<Plot x={{ axis: false }} y={{ type: 'band', axis: false }}>
    <BarX
        data={[1, 2, 3, 4, 5]}
        borderRadius={{ topRight: 10, bottomRight: 10 }} />
    <RuleX data={[0]} />
</Plot>
```
