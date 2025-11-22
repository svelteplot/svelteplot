---
title: Interactivity
---

SveltePlot makes creating interactive charts intuitive and straightforward using Svelte's reactive programming model. This page provides a brief overview of the various ways you can add interactivity to your plots.

## Events

SveltePlot components support standard DOM events like `onclick`, `onmouseover`, and `onmouseleave`. This makes it easy to respond to user interactions with your visualizations.

```svelte live
<script>
    import { Plot, RuleY, BarY } from 'svelteplot';

    let clicked = $state();

    let title = $derived(
        clicked
            ? `You clicked ${clicked}`
            : 'Click the bars'
    );
</script>

<Plot x={{ axis: false }} y={{ grid: true }} {title}>
    <BarY
        data={[-2, -1, 2, 4, 6, 9, 5]}
        cursor="pointer"
        opacity={{
            scale: null,
            value: (d) =>
                !clicked || clicked === d ? 1 : 0.5
        }}
        onclick={(event, d) => {
            clicked = d;
        }} />
    <RuleY data={[0]} />
</Plot>
```

## HTML Tooltips

The `HTMLTooltip` mark allows you to display HTML content when users hover over data points. This is useful when you need to show information that goes beyond simple labels.

```svelte live
<script>
    import { Plot, Dot, HTMLTooltip } from 'svelteplot';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot grid symbol={{ legend: true }}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="species"
        symbol="species" />
    {#snippet overlay()}
        <HTMLTooltip
            data={penguins}
            x="culmen_length_mm"
            y="culmen_depth_mm">
            {#snippet children({ datum })}
                <div class="tooltip">
                    <div>Species: {datum.species}</div>
                    <div>Island: {datum.island}</div>
                </div>
            {/snippet}
        </HTMLTooltip>
    {/snippet}
</Plot>

<style>
    .tooltip {
        background: white;
        background: var(--svelteplot-tooltip-bg);
        border: 1px solid #ccc;
        border-color: var(--svelteplot-tooltip-border);
        font-size: 12px;
        padding: 1ex 1em;
        border-radius: 3px;
        line-height: 1.2;
        box-shadow:
            rgba(50, 50, 93, 0.25) 0px 2px 5px -1px,
            rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
    }
</style>
```

```svelte
<Plot grid symbol={{ legend: true }}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="species"
        symbol="species" />
    {#snippet overlay()}
        <HTMLTooltip
            data={penguins}
            x="culmen_length_mm"
            y="culmen_depth_mm">
            {#snippet children({ datum })}
                <div class="tooltip">
                    <div>Species: {datum.species}</div>
                    <div>Island: {datum.island}</div>
                </div>
            {/snippet}
        </HTMLTooltip>
    {/snippet}
</Plot>

<style>
    .tooltip {
        background: white;
        background: var(--svelteplot-tooltip-bg);
        border: 1px solid #ccc;
        border-color: var(--svelteplot-tooltip-border);
        font-size: 12px;
        padding: 1ex 1em;
        border-radius: 3px;
        line-height: 1.2;
        box-shadow:
            rgba(50, 50, 93, 0.25) 0px 2px 5px -1px,
            rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
    }
</style>
```

## SVG Tooltips

SVG tooltips are created using the [Pointer](/marks/pointer) mark, which doesn't render anything by itself but lets you show other marks (like text labels or dots) near the cursor.

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
</script>

<Plot>
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
                dy="-5" />
            <Dot {data} x="Date" y="Close" fill />
        {/snippet}
    </Pointer>
</Plot>
```

## Brushing

The [Brush](/marks/brush) mark allows users to select data by dragging a rectangular area. This is useful for tasks like data filtering, zooming, or linking multiple views.

```svelte live
<script>
    import { Plot, Dot, Brush } from 'svelteplot';
    import { page } from '$app/state';

    let { penguins } = $derived(page.data.data);
    let brush = $state({ enabled: false });
</script>

<Plot grid>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="species"
        symbol="species" />
    <Brush bind:brush />
</Plot>
```

You can also use `BrushX` and `BrushY` to limit brushing to a single dimension, which is useful for time series data.

## Crosshair

Crosshairs provide a way to highlight data across dimensions. In SveltePlot, you can create crosshairs by combining the [Pointer](/marks/pointer) mark with rules and axes.

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

<Plot>
    <AxisX />
    <AxisY />
    <Line data={aapl} x="Date" y="Close" />
    <Pointer
        data={aapl}
        x="Date"
        y="Close"
        maxDistance={60}>
        {#snippet children({ data })}
            <RuleX {data} x="Date" opacity="0.6" />
            <RuleY {data} y="Close" opacity="0.6" />
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
