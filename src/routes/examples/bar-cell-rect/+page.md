---
title: Examples of Bar/Cell/Rect marks
---

This page shows many examples of the use of the `Bar`/`Cell`/`Rect` mark translated from the [Observable Plot Plot Gallery](https://observablehq.com/@observablehq/plot-gallery).
It only includes examples using the standard demo datasets from the [@observablehq/sample-datasets](www.npmjs.com/package/@observablehq/sample-datasets) package;
it excludes those with `FileAttachment`s added to Observable Notebooks.

## [Horizontal bar chart](https://observablehq.com/@observablehq/plot-horizontal-bar-chart)

> :warning: The form of the sort options differs from Observable Plot.

Direct translation:

```svelte live
<script>
    import { Plot, BarX, RuleX } from 'svelteplot';
    import { page } from '$app/state';

    let { alphabet } = $derived(page.data.data);
</script>

<Plot x={{ axis: 'top', grid: true, percent: true }}>
    <RuleX data={[0]} />
    <BarX
        data={alphabet}
        x="frequency"
        y="letter"
        sort={{
            y: 'x',
            reverse: true
        }} />
</Plot>
```

Manually fixed:

```svelte live
<script>
    import { Plot, BarX, RuleX } from 'svelteplot';
    import { page } from '$app/state';

    let { alphabet } = $derived(page.data.data);
</script>

<Plot x={{ axis: 'top', grid: true, percent: true }}>
    <RuleX data={[0]} />
    <BarX
        data={alphabet}
        x="frequency"
        y="letter"
        sort={{
            channel: 'x',
            order: 'descending'
        }} />
</Plot>
```

## [Vertical bar chart](https://observablehq.com/@observablehq/plot-vertical-bar-chart)

> :warning: The form of the sort options differs from Observable Plot.

Direct translation:

```svelte live
<script>
    import { Plot, BarY, RuleY } from 'svelteplot';
    import { page } from '$app/state';

    let { alphabet } = $derived(page.data.data);
</script>

<Plot y={{ grid: true, percent: true }}>
    <RuleY data={[0]} />
    <BarY
        data={alphabet}
        x="letter"
        y="frequency"
        sort={{
            x: 'y',
            reverse: true
        }} />
</Plot>
```

Manually fixed:

```svelte live
<script>
    import { Plot, BarY, RuleY } from 'svelteplot';
    import { page } from '$app/state';

    let { alphabet } = $derived(page.data.data);
</script>

<Plot y={{ grid: true, percent: true }}>
    <RuleY data={[0]} />
    <BarY
        data={alphabet}
        x="letter"
        y="frequency"
        sort={{
            channel: 'y',
            order: 'descending'
        }} />
</Plot>
```

## [Olympians grouped bar chart](https://observablehq.com/@observablehq/plot-olympians-grouped-bar-chart)

> :warning: For this to work I had to changed `y2: 'count`  to `y: 'count'`

```svelte live
<script>
    import { groupX, Plot, BarY, RuleY } from 'svelteplot';
    import { page } from '$app/state';

    let { olympians } = $derived(page.data.data);
</script>

<Plot
    marginBottom={100}
    fx={{
        padding: 0,
        label: null,
        tickRotate: 90,
        tickSize: 6
    }}
    x={{ axis: null, paddingOuter: 0.2 }}
    y={{ grid: true }}
    color={{ legend: true }}>
    <BarY
        {...groupX(
            {
                data: olympians,
                x: 'sex',
                fx: 'sport',
                fill: 'sex'
            },
            { y: 'count' }
        )} />
    <RuleY data={[0]} />
</Plot>
```

## [Stacked bars](https://observablehq.com/@observablehq/plot-stacked-bars)

```svelte live
<script>
    import { groupX, Plot, BarY, RuleY } from 'svelteplot';
    import { page } from '$app/state';

    let { penguins } = $derived(page.data.data);
</script>

<Plot color={{ legend: true }}>
    <BarY
        {...groupX(
            {
                data: penguins,
                x: 'island',
                fill: 'species'
            },
            {
                y: 'count'
            }
        )} />
</Plot>
```

## [Gradient bars](https://observablehq.com/@observablehq/plot-gradient-bars)

> ℹ️ This required manual adjustment.

```svelte live
<script>
    import { groupX, Plot, BarY, RuleY } from 'svelteplot';
    import { page } from '$app/state';

    let { alphabet } = $derived(page.data.data);
</script>

<Plot>
    <defs>
        <linearGradient
            id="gradient"
            gradientTransform="rotate(90)">
            <stop offset="15%" stop-color="purple" />
            <stop offset="75%" stop-color="red" />
            <stop offset="100%" stop-color="gold" />
        </linearGradient>
    </defs>

    <BarY
        data={alphabet}
        x="letter"
        y="frequency"
        fill="url(#gradient)" />
    <RuleY data={[0]} />
</Plot>
```

## [Stacked unit chart](https://observablehq.com/@observablehq/plot-stacked-unit-chart)

> :warning: This fails to render, with an error about "duplicate key in BarX.svelte".
> See [Issue #102](https://github.com/svelteplot/svelteplot/issues/102)

```svelte
<script>
    import { groupX, Plot, BarX, RuleX } from 'svelteplot';
    import { page } from '$app/state';

    let { penguins } = $derived(page.data.data);
</script>

<Plot
    marginLeft={60}
    x={{ label: 'Frequency →' }}
    y={{ label: null }}
    color={{ legend: true }}>
    <BarX
        data={penguins}
        y="species"
        x={1}
        inset={0.5}
        fill="body_mass_g"
        sort="body_mass_g" />
    <RuleX data={[0]} />
</Plot>
```

## [Stacked percentages](https://observablehq.com/@observablehq/plot-stacked-percentages)

> :warning: This fails to render. I also removed the `TextX` mark.

```svelte live
<script>
    import {
        stackX,
        Plot,
        BarX,
        RuleX,
        Text
    } from 'svelteplot';
    import { page } from '$app/state';

    let { alphabet } = $derived(page.data.data);
</script>

<Plot x={{ percent: true }}>
    <BarX
        {...stackX(
            { data: alphabet },
            {
                x: 'frequency',
                fillOpacity: 0.3,
                inset: 0.5
            }
        )} />
    <RuleX data={[0, 1]} />
</Plot>
```

## [Stacked histogram](https://observablehq.com/@observablehq/plot-vertical-histogram)

```svelte live
<script>
    import { binX, Plot, RectY, RuleY } from 'svelteplot';
    import { page } from '$app/state';

    let { olympians } = $derived(page.data.data);
</script>

<Plot y={{ grid: true }} color={{ legend: true }}>
    <RectY
        {...binX(
            { data: olympians, x: 'weight', fill: 'sex' },
            {
                y: 'count'
            }
        )} />
    <RuleY data={[0]} />
</Plot>
```

## [Overlapping histogram](https://observablehq.com/@observablehq/plot-overlapping-histogram)

> :warning: I had to change `y2: 'count'` to `y1: 'count'` for this to work - see [Issue #103](https://github.com/svelteplot/svelteplot/issues/103)

```svelte live
<script>
    import { binX, Plot, RectY, RuleY } from 'svelteplot';
    import { page } from '$app/state';

    let { olympians } = $derived(page.data.data);
</script>

<Plot round="true" color={{ legend: true }}>
    <RectY
        {...binX(
            {
                data: olympians,
                x: 'weight',
                fill: 'sex',
                mixBlendMode: 'multiply'
            },
            {
                y1: 'count'
            }
        )} />
    <RuleY data={[0]} />
</Plot>
```

<!-- TODO: add other 2 plots -->

## [Highlighted bin](https://observablehq.com/@observablehq/plot-highlighted-bin)

```svelte live
<script>
    import { binX, Plot, RectY, RuleY } from 'svelteplot';
    import { page } from '$app/state';

    let { olympians } = $derived(page.data.data);
    const test = (bin) => bin.some((d) => d.name === "Aaron Brown");
</script>

<Plot y={{ grid: true }}>
    <RectY
        {...binX(
            { data: olympians, x: 'weight' },
            {
                y: 'count',
                fill: test
            }
        )} />
    <RuleY data={[0]} />
</Plot>
```

## [Cumulative histogram](https://observablehq.com/@observablehq/plot-cumulative-histogram)

> :warning: The `cumulative` option needs to be moved for this to work.

A naive translation doesn't work:

```svelte live
<script>
    import { binX, Plot, RectY, RuleY } from 'svelteplot';
    import { page } from '$app/state';

    let { olympians } = $derived(page.data.data);
</script>

<Plot marginLeft={60} y={{ grid: true }}>
    <RectY
        {...binX(
            {
                data: olympians,
                x: 'weight',
                cumulative: +1
            },
            { y: 'count' }
        )} />
    <RuleY data={[0]} />
</Plot>
```


Because the `cumulative: +1` option needs to be provided in the first argument to `binX`, rather than second; it moves from being specified alongside `x: "weight"` in Observable Plot to being specified alongside `y: "count"`:


```svelte live
<script>
    import { binX, Plot, RectY, RuleY } from 'svelteplot';
    import { page } from '$app/state';

    let { olympians } = $derived(page.data.data);
</script>

<Plot marginLeft={60} y={{ grid: true }}>
    <RectY
        {...binX(
            { data: olympians, x: 'weight' },
            { y: 'count', cumulative: +1 }
        )} />
    <RuleY data={[0]} />
</Plot>
```

## [Quantitative dimensions heatmap](https://observablehq.com/@observablehq/plot-continuous-dimensions-heatmap)

> ℹ️ I switched from `diamonds` to `olympians` as the `diamonds` dataset was unavailable..

```svelte live
<script>
    import { bin, Plot, Rect } from 'svelteplot';
    import { page } from '$app/state';

    let { olympians } = $derived(page.data.data);
</script>

<Plot
    height={640}
    marginLeft={44}
    color={{ scheme: 'bupu', type: 'symlog' }}>
    <Rect
        {...bin(
            {
                data: olympians,
                x: 'height',
                y: 'weight',
                thresholds: '0'
            },
            { fill: 'count' }
        )} />
</Plot>
```
