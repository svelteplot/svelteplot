---
title: Pointer mark
---

Pointer is a mark that doesn't render anything by itself, but you can use it to show marks filtered to data points close to the cursor. You access the filtered data by placing the marks as children of the Pointer mark:

```svelte live
<script>
    import {
        Plot,
        Line,
        Dot,
        Text,
        Pointer
    } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);

    let sel = $state([]);
</script>

<Plot grid>
    <Line data={aapl} x="Date" y="Close" />
    <Pointer
        data={aapl}
        x="Date"
        y="Close"
        maxDistance={30}>
        {#snippet children({ data })}
            <Text
                {data}
                fill="currentColor"
                stroke="var(--svelteplot-bg)"
                strokeWidth="3"
                x="Date"
                y="Close"
                text={(d) => d.Close.toFixed()}
                lineAnchor="bottom"
                fontWeight="bold"
                dy={-5} />
            <Dot {data} x="Date" y="Close" fill />
        {/snippet}
    </Pointer>
</Plot>
```

```svelte
<Plot>
    <Line data={aapl} x="Date" y="Close" />
    <Pointer data={aapl} x="Date">
        {#snippet children({ data })}
            <Text
                {data}
                fill="currentColor"
                stroke="var(--svelteplot-bg)"
                strokeWidth="3"
                x="Date"
                y="Close"
                text={(d) => d.Close.toFixed()}
                lineAnchor="bottom"
                fontWeight="bold"
                dy={-5} />
            <Dot {data} x="Date" y="Close" fill />
        {/snippet}
    </Pointer>
</Plot>
```

[fork](https://svelte.dev/playground/a1220e8cb4d74338a3b7468466113df2?version=5)

You can create a "crosshair" mark by wrapping grids and axes marks inside a pointer mark:

```svelte live
<script>
    import {
        Plot,
        Line,
        RuleX,
        RuleY,
        AxisX,
        AxisY,
        Pointer
    } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<div style="touch-action: none">
    <Plot marginBottom={30}>
        <AxisX />
        <AxisY />
        <Line data={aapl} x="Date" y="Close" />
        <Pointer
            data={aapl}
            x="Date"
            y="Close"
            maxDistance={30}>
            {#snippet children({ data })}
                {#if data.length > 0}
                    <RuleX {data} x="Date" opacity="0.3" />
                    <RuleY {data} y="Close" opacity="0.3" />
                    <AxisX
                        data={data.map((d) => d.Date)}
                        tickFormat="MMM D, YYYY" />
                    <AxisY
                        data={data.map((d) => d.Close)}
                        tickFormat={(d) => d.toFixed()} />
                {/if}
            {/snippet}
        </Pointer>
    </Plot>
</div>
```

```svelte
<Plot>
    <AxisX />
    <AxisY />
    <Line data={aapl} x="Date" y="Close" />
    <Pointer
        data={aapl}
        x="Date"
        y="Close"
        maxDistance={30}>
        {#snippet children({ data })}
            <RuleX {data} x="Date" opacity="0.3" />
            <RuleY {data} y="Close" opacity="0.3" />
            <AxisX
                data={data.map((d) => d.Date)}
                tickFormat={(d) => d.getFullYear()} />
            <AxisY
                data={data.map((d) => d.Close)}
                tickFormat={(d) => d.toFixed()} />
        {/snippet}
    </Pointer>
</Plot>
```

If we only pass an **x** channel to the Pointer mark it will try to find the closest point along that axis:

```svelte live
<script>
    import {
        Plot,
        Line,
        RuleX,
        Dot,
        Text,
        Pointer
    } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot y={{ grid: true }} marginRight={20} height={250}>
    <Line data={aapl} x="Date" y="Close" />
    <Pointer data={aapl} x="Date" maxDistance={30}>
        {#snippet children({ data })}
            <RuleX {data} x="Date" opacity={0.2} />
            <Text
                {data}
                fill="currentColor"
                stroke="var(--svelteplot-bg)"
                strokeWidth="3"
                x="Date"
                y="Close"
                text={(d) => d.Close.toFixed()}
                lineAnchor="bottom"
                fontWeight="bold"
                dy="-10" />
            <Dot {data} x="Date" y="Close" fill />
        {/snippet}
    </Pointer>
</Plot>
```

```svelte
<Plot y={{ grid: true }}>
    <Line data={aapl} x="Date" y="Close" />
    <Pointer data={aapl} x="Date" maxDistance={30}>
        {#snippet children({ data })}
            <RuleX {data} x="Date" opacity={0.2} />
            <Dot {data} x="Date" y="Close" fill />
            <Text {data} ... />
        {/snippet}
    </Pointer>
</Plot>
```

We can use the `onupdate` event to fade out marks whenever points are highlighted:

```svelte live
<script>
    import {
        Plot,
        Line,
        RuleX,
        Dot,
        Text,
        Pointer
    } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);

    let sel = $state([]);
</script>

<Plot y={{ grid: true }} marginRight={20} height={250}>
    <Line
        data={aapl}
        x="Date"
        y="Close"
        opacity={sel.length ? 0.4 : 1} />
    <Pointer
        data={aapl}
        x="Date"
        maxDistance={30}
        onupdate={(e) => (sel = e)}>
        {#snippet children({ data })}
            <RuleX {data} x="Date" opacity={0.2} />
            <Text
                {data}
                fill="currentColor"
                stroke="var(--svelteplot-bg)"
                strokeWidth="3"
                x="Date"
                y="Close"
                text={(d) => d.Close.toFixed()}
                lineAnchor="bottom"
                fontWeight="bold"
                dy="-10" />
            <Dot {data} x="Date" y="Close" fill />
        {/snippet}
    </Pointer>
</Plot>
```

```svelte
<Plot y={{ grid: true }}>
    <Line
        data={aapl}
        x="Date"
        y="Close"
        opacity={seletion.length > 0 ? 0.4 : 1} />
    <Pointer
        data={aapl}
        x="Date"
        maxDistance={30}
        onupdate={(data) => (seletion = data)}>
        {#snippet children({ data })}
            <RuleX {data} x="Date" opacity={0.2} />
            <Dot {data} x="Date" y="Close" fill />
            <Text {data} ... />
        {/snippet}
    </Pointer>
</Plot>
```

This works for the **y** channel as well, but note that we only highlight one point at a time. That's because by default the Pointer mark will only return the closest point for each group:

```svelte live
<script>
    import {
        Plot,
        Line,
        RuleY,
        Dot,
        Text,
        Pointer
    } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
    let sel = $state([]);
</script>

<Plot marginRight={20}>
    <Line
        data={aapl}
        x="Date"
        y="Close"
        opacity={sel.length > 0 ? 0.4 : 1} />
    <Pointer
        data={aapl}
        y="Close"
        maxDistance={30}
        onupdate={(e) => (sel = e)}>
        {#snippet children({ data })}
            <RuleY {data} y="Close" opacity={0.2} />
            <Text
                {data}
                fill="currentColor"
                stroke="var(--svelteplot-bg)"
                strokeWidth="3"
                y="Close"
                text={(d) => d.Close.toFixed()}
                lineAnchor="middle"
                textAnchor="end"
                dx={-5}
                frameAnchor="left"
                fontWeight="bold" />
            <Dot {data} x="Date" y="Close" fill r={4} />
        {/snippet}
    </Pointer>
</Plot>
```

We can change this behavior by passing a **tolerance** option to the Pointer mark. This will return all points that are within the specified tolerance along the non-specified axis:

```svelte live
<script>
    import {
        Plot,
        Line,
        RuleY,
        Dot,
        Text,
        Pointer
    } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
    let sel = $state([]);
</script>

<Plot marginRight={20}>
    <Line
        data={aapl}
        x="Date"
        y="Close"
        opacity={sel.length > 0 ? 0.4 : 1} />
    <Pointer
        data={aapl}
        y="Close"
        maxDistance={30}
        tolerance={1}
        onupdate={(e) => (sel = e)}>
        {#snippet children({ data })}
            <RuleY {data} y="Close" opacity={0.2} />
            <Text
                {data}
                fill="currentColor"
                stroke="var(--svelteplot-bg)"
                strokeWidth="3"
                y="Close"
                text={(d) => d.Close.toFixed()}
                lineAnchor="middle"
                textAnchor="end"
                dx={-5}
                frameAnchor="left"
                fontWeight="bold" />
            <Dot {data} x="Date" y="Close" fill r={4} />
        {/snippet}
    </Pointer>
</Plot>
```

Another common use case is to show one point per group. This is useful when you have multiple lines in a line chart and want to show a tooltip for each line. You can achieve this by passing a **z** channel to the Pointer mark (see [example](/examples/pointer/grouped)):

```svelte live
<script>
    import {
        Plot,
        Line,
        RuleX,
        Dot,
        Text,
        Pointer
    } from 'svelteplot';
    import { page } from '$app/state';
    let { stocks } = $derived(page.data.data);
    let stocks2 = $derived(
        stocks.filter((d) => d.Date < new Date(2018, 0, 1))
    );
    let sel = $state([]);
</script>

<Plot
    testid="stocks-line-frame"
    y={{ type: 'log' }}
    marginRight={20}>
    <Line
        data={stocks2}
        x="Date"
        opacity={sel.length > 0 ? 0.4 : 1}
        y="Close"
        stroke="Symbol" />
    <Pointer
        data={stocks2}
        x="Date"
        z="Symbol"
        onupdate={(e) => (sel = e)}
        maxDistance={30}>
        {#snippet children({ data })}
            <Text
                {data}
                fill="Symbol"
                stroke="var(--svelteplot-bg)"
                strokeWidth="3"
                x="Date"
                y="Close"
                text={(d) => d.Close.toFixed()}
                lineAnchor="bottom"
                fontWeight="bold"
                dy="-7" />
            <Dot
                {data}
                x="Date"
                y="Close"
                fill="Symbol"
                strokeWidth="0.7"
                stroke="var(--svelteplot-bg)" />
        {/snippet}
    </Pointer>
</Plot>
```

## Pointer

Options:

- **data** - The data array to use for the pointer (required).
- **x** - The x channel to use for the pointer (optional).
- **y** - The y channel to use for the pointer (optional).
- **z** - An optional grouping channel. If provided, the pointer will try to find one point per group (optional).
- **maxDistance** - The maximum distance in pixels to consider a point "close" to the cursor (default: 30 pixel).
- **tolerance** -tolerance for considering points as "the same" when sharing x or y values (default: -Infinity).
- **onupdate** - An event handler that is called whenever the pointer position changes. The event detail contains the filtered data points.
- **children** - A slot that receives the filtered data points as a prop.
