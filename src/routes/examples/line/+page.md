---
title: Examples of Line marks
---

This page shows many examples of the use of the `Line` mark translated from the [Observable Plot Plot Gallery](https://observablehq.com/@observablehq/plot-gallery).
It only includes examples using the standard demo datasets from the [@observablehq/sample-datasets](www.npmjs.com/package/@observablehq/sample-datasets) package;
it excludes those with `FileAttachment`s added to Observable Notebooks.

## [Simple line chart](https://observablehq.com/@observablehq/plot-simple-line-chart)

```svelte live
<script>
    import { Plot, LineY } from 'svelteplot';
    import { page } from '$app/state';

    let { aapl } = $derived(page.data.data);
</script>

<Plot y={{ grid: true }}>
    <LineY data={aapl} x="Date" y="Close" />
</Plot>
```

## [Area chart](https://observablehq.com/@observablehq/plot-area-chart)

```svelte live
<script>
    import { Plot, AreaY } from 'svelteplot';
    import { page } from '$app/state';

    let { aapl } = $derived(page.data.data);
</script>

<Plot>
    <AreaY data={aapl} x="Date" y="Close" />
</Plot>
```

## [Area chart with gradient](https://observablehq.com/@observablehq/plot-area-chart-with-gradient)

```svelte live
<script>
    import { Plot, AreaY, LineY, RuleY } from 'svelteplot';
    import { page } from '$app/state';

    let { aapl } = $derived(page.data.data);
</script>

<Plot y={{ grid: true }}>
    <defs>
        <linearGradient
            id="gradient"
            gradientTransform="rotate(90)">
            <stop
                offset="20%"
                stop-color="steelblue"
                stop-opacity="0.5" />
            <stop
                offset="100%"
                stop-color="brown"
                stop-opacity="0" />
        </linearGradient>
    </defs>

    <AreaY
        data={aapl}
        x="Date"
        y="Close"
        fill="url(#gradient)" />
    <LineY
        data={aapl}
        x="Date"
        y="Close"
        stroke="steelblue" />
    <RuleY data={[0]} />
</Plot>
```

## [Bollinger bands](https://observablehq.com/@observablehq/plot-bollinger-bands)

```svelte live
<script>
    import {
        mapY,
        Plot,
        BollingerY,
        LineY
    } from 'svelteplot';
    import { Slider } from '$lib/ui';

    import { page } from '$app/state';

    let { aapl } = $derived(page.data.data);

    let n = $state(20);
    let k = $state(2);
</script>

<Slider bind:value={n} label="Periods (n)" max={100} />

<Slider
    bind:value={k}
    label="Deviations (K)"
    max={4}
    step={0.1} />

<Plot y={{ grid: true }}>
    <BollingerY
        data={aapl}
        {n}
        {k}
        x="Date"
        y="Close"
        stroke="none" />
    <LineY data={aapl} x="Date" y="Close" strokeWidth={1} />
</Plot>
```

## [Line with missing data](https://observablehq.com/@observablehq/plot-line-chart-with-gaps)

```svelte live
<script>
    import { Plot, AreaY, LineY, RuleY } from 'svelteplot';
    import { page } from '$app/state';

    let { aapl } = $derived(page.data.data);
</script>

<Plot y={{ grid: true }}>
    <LineY
        data={aapl}
        x="Date"
        y={(d) =>
            d.Date.getUTCMonth() < 3 ? NaN : d.Close} />
</Plot>
```

Contrast with a chart where missing values have been filtered out:

```svelte live
<script>
    import { Plot, AreaY, LineY, RuleY } from 'svelteplot';
    import { page } from '$app/state';

    let { aapl } = $derived(page.data.data);
</script>

<Plot y={{ grid: true }}>
    <LineY
        data={aapl}
        filter={(d) => d.Date.getUTCMonth() >= 3}
        x="Date"
        y="Close"
        strokeOpacity={0.3} />
    <LineY
        data={aapl}
        x="Date"
        y={(d) =>
            d.Date.getUTCMonth() < 3 ? NaN : d.Close} />
</Plot>
```

## [Line chart, percent change](https://observablehq.com/@observablehq/plot-line-chart-percent-change)

> :warning: Setting `ticks: 12` within the `y` prop of `<Plot>` breaks the plot.

```svelte live
<script>
    import {
        normalizeY,
        Plot,
        Line,
        RuleY
    } from 'svelteplot';
    import { Slider } from '$lib/ui';

    import { page } from '$app/state';

    let { aapl } = $derived(page.data.data);

    let basis = $state(64.96);
</script>

<Slider
    bind:value={basis}
    label="Basis"
    max={190.03}
    step={0.01} />

<Plot
    width={928}
    marginLeft={45}
    y={{
        type: 'log',
        tickFormat: (d) =>
            `${d > 1 ? '+' : ''}${Math.round(100 * (d - 1))}%`,
        grid: true
    }}>
    <RuleY data={[1]} />
    <Line
        {...normalizeY(
            {
                data: aapl,
                x: 'Date',
                y: 'Close',
                stroke: 'steelblue'
            },
            () => basis
        )} />
</Plot>
```

## [Overlapping density estimations](https://observablehq.com/@observablehq/plot-overlapping-density-estimations)

> :warning: The 'proportion' reducer is not currently implemented ([Issue #96](https://github.com/svelteplot/svelteplot/issues/96))
> Also, SveltePlot does not currently allow just `y2` (rather than `y`, or `y1` and `y2` jointly) to be set for an Area mark - [Issue #97](https://github.com/svelteplot/svelteplot/issues/97)

```svelte
<script>
    import {
        binX,
        normalizeY,
        Plot,
        AreaY,
        RuleY,
        LineY
    } from 'svelteplot';
    import { Slider } from '$lib/ui';

    import { page } from '$app/state';

    let { penguins } = $derived(page.data.data);
</script>

<Plot
    height={300}
    marginLeft={60}
    y={{ axis: null }}
    x={{ nice: true }}
    fy={{ domain: ['FEMALE', 'MALE'] }}
    color={{ legend: true }}
    facet={{ data: penguins, y: 'sex' }}>
    <AreaY
        {...binX(
            {
                data: penguins,
                x: 'culmen_length_mm',
                fill: 'species',
                fillOpacity: '.',
                thresholds: '',
                curve: 'natural'
            },
            { y2: 'proportion' }
        )} />

    <RuleY data={[0]} />

    <LineY
        {...binX(
            {
                data: penguins,
                x: 'culmen_length_mm',
                stroke: 'species',
                thresholds: '',
                curve: 'natural'
            },
            { y: 'proportion' }
        )} />
</Plot>
```

## [Continuous histogram](https://observablehq.com/@observablehq/plot-density-estimation)

```svelte live
<script>
    import {
        binX,
        normalizeY,
        Plot,
        AreaY,
        RuleY,
        LineY
    } from 'svelteplot';
    import { Slider } from '$lib/ui';

    import { page } from '$app/state';

    let { olympians } = $derived(page.data.data);
</script>

<Plot y={{ grid: true }}>
    <AreaY
        {...binX(
            {
                data: olympians,
                x: 'weight',
                fillOpacity: '.'
            },
            {
                y: 'count',
                filter: null
            }
        )} />
    <LineY
        {...binX(
            { data: olympians, x: 'weight' },
            {
                y: 'count',
                filter: null
            }
        )} />
    <RuleY data={[0]} />
</Plot>
```

## [Variable fill area](https://observablehq.com/@observablehq/plot-variable-fill-area)

> :warning: This renders incorrectly: there should be vertical strips in different colors.
> SveltePlot does not currently support variable fills for areas - see [Issue #94](https://github.com/svelteplot/svelteplot/issues/94)

```svelte live
<script>
    import {
        binX,
        normalizeY,
        Plot,
        AreaY,
        RuleY,
        LineY
    } from 'svelteplot';
    import { Slider } from '$lib/ui';

    import { page } from '$app/state';

    let { aapl } = $derived(page.data.data);
</script>

<Plot color={{ type: 'log', legend: true }}>
    <AreaY
        data={aapl}
        x="Date"
        y="Close"
        fill="Volume"
        z="null" />
    <RuleY data={[0]} />
</Plot>
```

## Area chart, missing data

This is based on [this example](https://observablehq.com/@observablehq/plot-area-chart-missing-data), but modified.

```svelte live
<script>
    import { Plot, AreaY, LineY, RuleY } from 'svelteplot';
    import { page } from '$app/state';

    let { aapl } = $derived(page.data.data);
</script>

<Plot y={{ grid: true }}>
    <AreaY
        data={aapl}
        x="Date"
        y={(d) =>
            d.Date.getUTCMonth() < 3 ? NaN : d.Close} />
</Plot>
```

Contrast with a chart where missing values have been filtered out:

```svelte live
<script>
    import { Plot, AreaY, LineY, RuleY } from 'svelteplot';
    import { page } from '$app/state';

    let { aapl } = $derived(page.data.data);
</script>

<Plot y={{ grid: true }}>
    <AreaY
        data={aapl}
        filter={(d) => d.Date.getUTCMonth() >= 3}
        x="Date"
        y="Close"
        strokeOpacity={0.3}
        fill="#ccc" />
    <AreaY
        data={aapl}
        x="Date"
        y={(d) =>
            d.Date.getUTCMonth() < 3 ? NaN : d.Close} />
</Plot>
```
