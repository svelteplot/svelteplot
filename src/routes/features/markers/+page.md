---
title: Markers
---

Markers can be used with the [line](/marks/line) and [link](/marks/link) marks. Markers are automatically scaled with the line width:

```svelte live
<script>
    import { Plot, Line } from 'svelteplot';
    import Select from '$lib/ui/Select.svelte';
    import Slider from '$lib/ui/Slider.svelte';

    let marker = $state('circle-stroke');
    let strokeWidth = $state(1.5);

    const options = [
        'dot',
        'circle',
        'circle-stroke',
        'arrow',
        'arrow-reverse',
        'tick',
        'tick-x',
        'tick-y'
    ];

    import { page } from '$app/state';
    let { crimea } = $derived(page.data.data);
</script>

<Select label="Marker:" bind:value={marker} {options} />
<Slider
    label="Stroke width"
    bind:value={strokeWidth}
    min={1}
    max={5}
    step={0.1} />
<br />
<Plot inset={10} grid>
    <Line
        data={crimea}
        x="date"
        y="deaths"
        stroke="cause"
        {strokeWidth}
        {marker} />
</Plot>
```

```svelte
<Plot>
    <Line
        data={crimea}
        x="date"
        y="deaths"
        stroke="cause"
        strokeWidth={1.5}
        marker="dot" />
</Plot>
```

## Marker options

The supported marker options are:

- **markerStart** - the marker for the starting point of a line segment
- **markerMid** - the marker for any intermediate point of a line segment
- **markerEnd** - the marker for the end point of a line segment
- **marker** - shorthand for setting the marker on all points

The following named markers are supported:

- _dot_ - a filled circle without a stroke and 2.5px radius
- _circle_ - a filled circle with a white stroke and 3px radius
- _circle-stroke_ - a hollow circle with a colored stroke and a white fill and 3px radius
- _arrow_ - an arrowhead with auto orientation
- _arrow-reverse_ - an reversed arrowhead with auto orientation
- _tick_ - a small perpendicular line
- _tick-x_ - a small horizontal line
- _tick-y_ - a small vertical line

You can specify the markers separately for the start of the line (**markerStart**), the end of the line (**markerEnd**) or the points in-between (**markerMid**) -- or you can set the **marker** option for all of them.

Note that for the interpolation methods `basis`, `bundle`, and `step`, the marker symbols will not be placed at the location of the data points (shown as **+** below).

```svelte live
<script lang="ts">
    import { Plot, LineY, Dot } from 'svelteplot';
    import Slider from '$lib/ui/Slider.svelte';
    import Select from '$lib/ui/Select.svelte';
    import type { CurveName } from '$lib/types/index.js';

    // curve demo
    const numbers = [
        0.25, 0.09, 0.58, 0.22, 0.38, 0.03, 0.45, 0.12,
        0.87, 0.99, 0.85, 0.5, 0.64, 0.86, 0.6, 0.09, 0.14,
        0.95, 0.92, 0.89
    ];
</script>

<Plot height={250} grid>
    <LineY
        data={numbers}
        curve="basis"
        marker="circle-stroke" />
    <!-- TODO: use DotY here -->
    <Dot
        data={numbers.map((d, i) => ({
            value: d,
            index: i
        }))}
        symbol="plus"
        y="value"
        x="index" />
</Plot>
```

```svelte
<Plot grid>
    <LineY
        data={numbers}
        curve="basis"
        marker="circle-stroke" />
    <DotY data={numbers} symbol="plus" />
</Plot>
```

[fork](https://svelte.dev/playground/0be2cc3070c844e692a3300d87212f58?version=5)

## Custom markers

You can also specify a custom marker icon using the `marker` snippet:

```svelte live
<script lang="ts">
    import { Plot, Line } from 'svelteplot';
    import type { Datasets } from '$lib/types/index.js';

    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot grid height={300}>
    <Line data={aapl.slice(-40)} x="Date" y="Adj Close">
        {#snippet marker(id, color)}
            <marker
                {id}
                fill="none"
                stroke={color}
                markerWidth="6"
                markerHeight="10"
                viewBox="-4 -10 8 10"
                orient="auto">
                <path d="M0,-10L0,-2m-3,-3 l3,3l3,-3" />
            </marker>
        {/snippet}
    </Line>
</Plot>
```

```svelte
<Plot grid height={300}>
    <Line data={aapl.slice(-40)} x="Date" y="Adj Close">
        {#snippet marker(id, color)}
            <marker
                {id}
                fill="none"
                stroke={color}
                markerWidth="6"
                markerHeight="6"
                viewBox="-4 -8 8 8"
                orient="auto">
                <path d="M0,-8L0,0M-3,-6 L0,0 L3,-6" />
            </marker>
        {/snippet}
    </Line>
</Plot>
```

[fork](https://svelte.dev/playground/2e63a26ff02646db90f2e33849668033?version=5)

And since the marker snippets contain regular Svelte code, you can do whatever you want with the markers, like animate them, for instance:

```svelte live
<script lang="ts">
    import { Plot, Line } from 'svelteplot';
    import { fly, fade } from 'svelte/transition';

    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);

    let shown = $state(false);

    $effect(() => {
        const t = setInterval(() => {
            shown = !shown;
        }, 1000);
        return () => clearInterval(t);
    });
</script>

<Plot grid height={300}>
    <Line data={aapl.slice(-40)} x="Date" y="Adj Close">
        {#snippet marker(id, color)}
            <marker
                {id}
                fill="none"
                stroke={color}
                markerWidth="6"
                markerHeight="10"
                viewBox="-4 -10 8 10"
                orient="auto">
                {#if shown}
                    <path
                        in:fly={{ duration: 1000, y: -10 }}
                        out:fade
                        d="M0,-10L0,-2m-3,-3 l3,3l3,-3" />
                {/if}
            </marker>
        {/snippet}
    </Line>
</Plot>
```

```svelte
<!-- <Plot><Line> -->
{#snippet marker(id, color)}
    <marker
        {id}
        fill="none"
        stroke={color}
        ...
        orient="auto">
        {#if shown}
            <path
                in:fly={{ duration: 1000, y: -10 }}
                out:fade
                d="M0,-10L0,-2m-3,-3 l3,3l3,-3" />
        {/if}
    </marker>
{/snippet}
<!-- </Line></Plot> -->
```

[fork](https://svelte.dev/playground/f02d094c5761416ca1c2f14e1f6d168d?version=5)
