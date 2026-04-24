---
title: What is SveltePlot?
description: How to use SveltePlot
---

SveltePlot is a Svelte 5 framework for visualizing tabular data. SveltePlot is inspired by [Observable Plot](https://observablehq.com/plot/), but implemented as a set of reactive components (you can find out about the [differences here](/why-svelteplot))

You can use SveltePlot to create charts with a concise and minimal API. It abstracts away the rendering details using **marks** and allows for basic client-side data **transforms**.

:::info
The fastest way to learn SveltePlot is to familiarize yourself with [Observable Plot](https://observablehq.com/plot/)! SveltePlot is using a lot of the same concepts and marks.
:::

## Marks

Let's start with a very simple chart to explain the concepts. In the following example the `aapl` variable stores an array of objects that look like this:

```js
[{
  Date: new Date("2013-05-13"),
  Open: 64.50,
  High: 65.41,
  Low: 64.5,
  Close: 64.96,
  Volume: 79237200
}, { ... }]
```

If we want to plot a line showing the closing price over time, all we have to write is this:

```svelte
<Plot>
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

...and we get this nice plot:

```svelte live
<script>
    import { Plot, Line } from 'svelteplot';
    import { page } from '$app/state';
    const { aapl } = $derived(page.data.data);
</script>

<Plot>
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

[Fork](https://svelte.dev/playground/ec67a8a48dce45c29373781a6b68491a)

:::info
Noticed how SveltePlot added **axes automatically**? That's because it assumes that most plots will benefit from axes and it adds them implicitly. (You can disable this by passing `axes={false}` to the Plot component).
:::

Let's say we also want to add a grid and a horizontal rule at zero. To activate the implicit grids we set the `grid` flag. Then we add the `RuleY` mark with `y` set to zero.

```svelte
<Plot grid>
    <RuleY y={0} />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

```svelte live
<script>
    import { Plot, Line, RuleY } from 'svelteplot';
    import { page } from '$app/state';
    const { aapl } = $derived(page.data.data);
</script>

<Plot grid>
    <Line data={aapl} x="Date" y="Close" />
    <RuleY y={0} />
</Plot>
```

:::info
Noticed how SveltePlot automatically extended the range of the y axis? That's because the Plot component "collects" the data from all the marks to automatically compute the scale extents.
:::

Now, let's also fill the area between the line and the horizontal rule by adding the `AreaY` mark and setting the same props as we used for the `Line` mark plus the opacity for a nicer look

```svelte
<Plot grid>
    <RuleY y={0} />
    <AreaY data={aapl} x="Date" y="Close" opacity={0.2} />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

```svelte live
<script>
    import { Plot, Line, AreaY, RuleY } from 'svelteplot';
    import { page } from '$app/state';
    const { aapl } = $derived(page.data.data);
</script>

<Plot grid>
    <RuleY y={0} />
    <AreaY data={aapl} x="Date" y="Close" opacity={0.2} />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

[Fork](https://svelte.dev/playground/a69fab2b3d9d445ab0adaef7f5d17006)

Since SveltePlots are just SVG, you can mix in SVG elements. Let's say we want to fill the area with a [linear gradient](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient). We can just use the `<linearGradient>` in SVG and use its `id` as `fill` url for the Area mark:

```svelte
<Plot grid>
    <RuleY y={0} />
    <defs>
        <linearGradient
            id="my-gradient"
            gradientTransform="rotate(90)">
            <stop
                offset="0%"
                stop-color="gold"
                stop-opacity={0.5} />
            <stop
                offset="100%"
                stop-color="red"
                stop-opacity={0.01} />
        </linearGradient>
    </defs>
    <AreaY
        data={aapl}
        x="Date"
        y="Close"
        fill="url(#my-gradient)" />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

```svelte live
<script>
    import { Plot, Line, AreaY, RuleY } from 'svelteplot';
    import { page } from '$app/state';
    const { aapl } = $derived(page.data.data);
</script>

<Plot grid>
    <RuleY y={0} />
    <defs>
        <linearGradient
            id="my-gradient"
            gradientTransform="rotate(90)">
            <stop
                offset="0%"
                stop-color="gold"
                stop-opacity={0.5} />
            <stop
                offset="100%"
                stop-color="red"
                stop-opacity={0.01} />
        </linearGradient>
    </defs>
    <AreaY
        data={aapl}
        x="Date"
        y="Close"
        fill="url(#my-gradient)" />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

[Fork](https://svelte.dev/playground/b77bacafa8534118b86d397be79bfad4)

You can learn more about all the marks in the documentation, e.g. [Area](/marks/area)

## Transforms

Our dataset contains daily data, but what if we want to show monthly aggregates instead? Thanks to the **transforms** you can do this in your visualization code. The [binX](/transforms/bin) transform can aggregate temporal data into "bins" based on a specified interval:

```svelte
<Plot grid>
    <!-- daily data -->
    <Line data={aapl} x="Date" y="Close" opacity={0.3} />
    <!-- monthly averages -->
    <Line
        {...binX(
            { data: aapl, x: 'Date', y: 'Close' },
            { interval: 'month', y: 'mean' }
        )}
        curve="basis" />
</Plot>
```

```svelte live
<script>
    import { Plot, Line, binX } from 'svelteplot';
    import { page } from '$app/state';
    const { aapl } = $derived(page.data.data);
</script>

<Plot grid>
    <Line data={aapl} x="Date" y="Close" opacity={0.3} />
    <Line
        curve="basis"
        {...binX(
            { data: aapl, x: 'Date', y: 'Close' },
            { interval: 'month', y: 'mean' }
        )} />
</Plot>
```

[Fork](https://svelte.dev/playground/e5057e8db853469893108c2e1d501eee)

We can also use the binX transform to compute the min and max closing value of each week and show it as an area:

```svelte
<Plot grid>
    <Line data={aapl} x="Date" y="Close" />
    <AreaY
        fill="red"
        opacity={0.3}
        {...binX(
            {
                data: aapl,
                x: 'Date',
                y1: 'Close',
                y2: 'Close'
            },
            { interval: 'month', y1: 'min', y2: 'max' }
        )} />
</Plot>
```

```svelte live
<script>
    import { Plot, Line, AreaY, binX } from 'svelteplot';
    import { page } from '$app/state';
    const { aapl } = $derived(page.data.data);
</script>

<Plot grid>
    <Line data={aapl} x="Date" y="Close" />
    <AreaY
        fill="var(--svp-red)"
        opacity={0.3}
        {...binX(
            {
                data: aapl,
                x: 'Date',
                y1: 'Close',
                y2: 'Close'
            },
            { interval: 'month', y1: 'min', y2: 'max' }
        )} />
</Plot>
```

[Fork](https://svelte.dev/playground/f9d1b38f91cc4f24ab63a616a3e1c1c3)

## sdsd

The **Line** component we're using is called a **mark**, and it represents the geometric shape showing the line. The idea is that the marks can handle a lot of the complexities that you'd otherwise have to code each and every time.

Also, somehow, these axes already know the extent of our data! This is possible because all the marks let the Plot component know about the data!

```svelte
<Plot axes={false}>
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

```svelte live
<script>
    import { Plot, Line } from 'svelteplot';
    import { page } from '$app/state';
    const { aapl } = $derived(page.data.data);
</script>

<Plot axes={false}>
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

Similarly, you can enable the implicit grids by setting `grid` to `true`:

```svelte
<Plot grid>
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

```svelte live
<script>
    import { Plot, Line } from 'svelteplot';
    import { page } from '$app/state';
    const { aapl } = $derived(page.data.data);
</script>

<Plot grid>
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

And somehow these axes already know the extent of the data we passed to the line mark!

```svelte --live
<script>
    import { Plot, Dot } from 'svelteplot';
    import { page } from '$app/state';

    let { olympians } = $derived(page.data.data);
</script>

<Plot
    testid="olympians"
    grid
    color={{ legend: true }}
    x={{ type: 'linear', insetLeft: 30, grid: true }}
    inset={10}>
    <Dot
        data={olympians}
        canvas
        x="weight"
        opacity="0.5"
        y="height"
        stroke="sex" />
</Plot>
```

```svelte
<Plot
    grid
    color={{ legend: true }}
    x={{ type: 'linear', insetLeft: 30, grid: true }}
    inset={10}>
    <Dot
        data={olympians}
        x="weight"
        y="height"
        opacity="0.5"
        stroke="sex"
        canvas />
</Plot>
```

This scatterplot suffers from overplotting: many dots are drawn in the same spot, so it’s hard to perceive density. We can fix this by applying a [bin transform](/transforms/bin) to group athletes of similar height and weight (and sex), and then use opacity to encode the number of athletes in the bin.

```svelte --live
<script>
    import { Plot, Rect, bin } from 'svelteplot';
    import Mark from 'svelteplot/Mark.svelte';
    import { page } from '$app/state';
    let { olympians } = $derived(page.data.data);

    let args = $derived(
        bin(
            {
                data: olympians,
                x: 'weight',
                y: 'height',
                fill: 'sex'
            },
            { fillOpacity: 'count' }
        )
    );
</script>

{#if olympians}
    <Plot testid="olympians-binned">
        <Rect {...args} inset={0} />
    </Plot>
{/if}
```

We can use the [binX transform](/transforms/bin) to compute a weight distribution.

```svelte --live
<script>
    import {
        Plot,
        Dot,
        RectY,
        GridY,
        AxisX,
        AxisY,
        RuleY,
        DotX,
        binX
    } from 'svelteplot';
    import Mark from 'svelteplot/Mark.svelte';
    import { page } from '$app/state';
    let { olympians } = $derived(page.data.data);
</script>

{#if olympians}
    <Plot grid testid="olympians-hist">
        <RectY
            {...binX(
                {
                    data: olympians,
                    x: 'weight',
                    fill: 'sex'
                },
                { y: 'count' }
            )} />
        <RuleY data={[0]} />
    </Plot>
{/if}
```

```svelte
<Plot grid>
    <RectY
        {...binX(
            { data: olympians, x: 'weight', fill: 'sex' },
            { y: 'count' }
        )} />
    <RuleY data={[0]} />
</Plot>
```

Or we can use the built-in [faceting](/features/facets) to look at the distributions separately:

```svelte --live
<script>
    import {
        Plot,
        Dot,
        RectY,
        GridY,
        AxisX,
        AxisY,
        RuleY,
        DotX,
        binX
    } from 'svelteplot';
    import Mark from 'svelteplot/Mark.svelte';
    import { page } from '$app/state';
    let { olympians } = $derived(page.data.data);
</script>

{#if olympians}
    <Plot grid testid="olympians-hist-facet">
        <RectY
            {...binX(
                {
                    data: olympians,
                    x: 'weight',
                    fill: 'sex',
                    fy: 'sex'
                },
                { y: 'count' }
            )} />
        <RuleY data={[0]} />
    </Plot>
{/if}
```

```svelte
<Plot>
    <RectY
        {...binX(
            {
                data: olympians,
                x: 'weight',
                fill: 'sex',
                fy: 'sex'
            },
            { y: 'count' }
        )} />
    <RuleY data={[0]} />
</Plot>
```

## What can SveltePlot do?

As of now, SveltePlot only implements a subset of Plots features.
