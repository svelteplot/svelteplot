---
title: Rect mark
---

The Rect mark can be used to add rectangles to the plot, defined by x1, y1, x2, and y2 coordinates. It is useful in cases where both the x and y axis are using quantitative scales.

:::tip
**Tip:** If one of your axes is a band scale, you may want to use the [Bar](/marks/bar) marks instead, and if both axes are band scales you probably need the [Cell](/marks/cell) mark.
:::

In it's purest form, the `<Rect>` mark will just add rectangles at the given coordinates:

```svelte live
<script>
    import { Plot, Rect, Text } from 'svelteplot';

    const data = [
        {
            x1: 10,
            x2: 15,
            y1: 5,
            y2: 9
        },
        {
            x1: 7,
            x2: 12,
            y1: 7,
            y2: 13
        }
    ];
</script>

<Plot grid inset={10}>
    <Rect
        {data}
        x1="x1"
        x2="x2"
        y1="y1"
        y2="y2"
        stroke="currentColor"
        fill="currentColor"
        fillOpacity={0.5} />
</Plot>
```

```svelte
<Plot grid inset={10}>
    <Rect {data} x1="x1" x2="x2" y1="y1" y2="y2" />
</Plot>
```

[fork](https://svelte.dev/playground/7a6b0ae12c624ffeb52448adac644b5b?version=5)

If your data does not come with x1/x2 and y1/y2 pairs but x/y coordinates, you can use the implicit interval transform:

```svelte live
<script>
    import { Plot, Rect, Text } from 'svelteplot';

    const data = [
        { x: 1, y1: 5, y2: 8 },
        { x: 3, y1: 7, y2: 11 }
    ];
</script>

<Plot grid inset={10}>
    <Rect
        {data}
        x="x"
        y1="y1"
        y2="y2"
        interval={1}
        stroke="currentColor"
        fill="currentColor"
        fillOpacity={0.5} />
</Plot>
```

```svelte
<Plot grid inset={10}>
    <Rect {data} x="x" y="y" interval={1} />
</Plot>
```

The interval transform may be used to convert a single value in x or y (or both) into an extent. For example, the chart below shows the observed daily maximum temperature in Seattle for the year 2015. The day-in-month and month-in-year numbers are expanded to unit intervals by setting the [interval option](/transforms/interval) to 1.

```svelte live
<script>
    import { Plot, Rect, Text } from 'svelteplot';
    import { page } from '$app/state';
    const { seattle } = $derived(page.data.data);
</script>

<Plot
    aspectRatio={1}
    y={{
        ticks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        tickFormat: (d) =>
            new Intl.DateTimeFormat('en', {
                month: 'narrow'
            }).format(new Date(2000, d, 1))
    }}
    testid="seattle-temp">
    <Rect
        data={seattle}
        filter={(d) => d.date.getUTCFullYear() === 2015}
        x={(d) => d.date.getUTCDate()}
        y={(d) => d.date.getUTCMonth()}
        interval={1}
        fill="temp_max"
        inset="0.5" />
</Plot>
```

```svelte
<Plot
    aspectRatio={1}
    y={{
        ticks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        tickFormat: (d) =>
            new Intl.DateTimeFormat('en', {
                month: 'narrow'
            }).format(new Date(2000, d, 1))
    }}>
    <Rect
        data={seattle}
        filter={(d) => d.date.getUTCFullYear() === 2015}
        x={(d) => d.date.getUTCDate()}
        y={(d) => d.date.getUTCMonth()}
        interval={1}
        fill="temp_max"
        inset="0.5" />
</Plot>
```

## Rect

## RectX

RectX can be used for range annotations:

```svelte live
<script>
    import { Plot, Line, RectX } from 'svelteplot';

    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot>
    <Line data={aapl} x="Date" y="Close" />
    <RectX
        data={[
            {
                from: new Date(2014, 0, 1),
                to: new Date(2016, 0, 1)
            }
        ]}
        x1="from"
        x2="to"
        fillOpacity={0.1} />
</Plot>
```

```svelte
<Plot>
    <Line data={aapl} x="Date" y="Close" />
    <RectX
        data={[
            {
                from: new Date(2014, 0, 1),
                to: new Date(2016, 0, 1)
            }
        ]}
        x1="from"
        x2="to"
        fillOpacity={0.1} />
</Plot>
```

## RectY

RectY can be used for range annotations:

```svelte live
<script>
    import { Plot, Line, RectY } from 'svelteplot';

    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot>
    <Line data={aapl} x="Date" y="Close" />
    <RectY
        data={[{ from: 120, to: 140 }]}
        y1="from"
        y2="to"
        fillOpacity={0.1} />
</Plot>
```

```svelte
<Plot>
    <Line data={aapl} x="Date" y="Close" />
    <RectY
        data={[{ from: 120, to: 140 }]}
        y1="from"
        y2="to"
        fillOpacity={0.1} />
</Plot>
```

## Stacking

RectX marks can be stacked along the x dimension (over identical y1 values):

```svelte live
<script>
    import { Plot, RectX } from 'svelteplot';

    const data = [
        {
            width: 2.5,
            height: 1,
            category: 'A'
        },
        {
            width: 3,
            height: 4,
            category: 'B'
        },
        {
            width: 4,
            height: 3,
            category: 'C'
        }
    ];
</script>

<Plot height={300} color={{ legend: true }}>
    <RectX
        {data}
        x="width"
        y1={0}
        y2="height"
        fill="category"
        insetRight={1} />
</Plot>
```

```svelte
<Plot>
    <RectX
        {data}
        x="width"
        y1={0}
        y2="height"
        fill="category"
        insetRight={1} />
</Plot>
```

[fork](https://svelte.dev/playground/9fe225752dbd43fdb00123dcf7bf9441?version=5)

RectY marks can be stacked along y (over identical x1 values).

```svelte live
<script>
    import { Plot, RectY } from 'svelteplot';

    const data = [
        { width: 2.5, height: 1, category: 'A' },
        { width: 3, height: 4, category: 'B' },
        { width: 4, height: 3, category: 'C' }
    ];
</script>

<Plot height={300} color={{ legend: true }}>
    <RectY
        {data}
        x1={0}
        x2="width"
        y="height"
        fill="category"
        insetBottom={1} />
</Plot>
```

```svelte
<Plot>
    <RectY
        {data}
        x1={0}
        x2="width"
        y="height"
        fill="category"
        insetBottom={1} />
</Plot>
```

[fork](https://svelte.dev/playground/4db4c6caea4f4329a30c1f18c46ea7d9?version=5)
