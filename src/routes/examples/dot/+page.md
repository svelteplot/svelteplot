---
title: Examples of Dot mark
---

This page shows many examples of the use of the `Dot` mark translated from the [Observable Plot Plot Gallery](https://observablehq.com/@observablehq/plot-gallery).
It only includes examples using the standard demo datasets from the [@observablehq/sample-datasets](www.npmjs.com/package/@observablehq/sample-datasets) package;
it excludes those with `FileAttachment`s added to Observable Notebooks.

## [Scatterplot](https://observablehq.com/@observablehq/plot-scatterplot/2)

```svelte live
<script>
    import { Plot, Dot, RuleY } from 'svelteplot';
    import { page } from '$app/state';

    let { penguins } = $derived(page.data.data);
</script>

<Plot>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm" />
</Plot>
```

## [Color Scatterrplot](https://observablehq.com/@observablehq/color-scatterplot)

```svelte live
<script>
    import { Plot, Dot, RuleY } from 'svelteplot';
    import { page } from '$app/state';

    let { penguins } = $derived(page.data.data);
</script>

<Plot>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="species" />
</Plot>
```

## [Symbol channel](https://observablehq.com/@observablehq/plot-symbol-channel)

```svelte live
<script>
    import { Plot, Dot, RuleY } from 'svelteplot';
    import { page } from '$app/state';

    let { penguins } = $derived(page.data.data);
</script>

<Plot
    grid="true"
    x={{ label: 'Body mass (g) →' }}
    y={{ label: '↑ Flipper length (mm)' }}
    symbol={{ legend: true }}>
    <Dot
        data={penguins}
        x="body_mass_g"
        y="flipper_length_mm"
        stroke="species"
        symbol="species" />
</Plot>
```

## [Scatterplot with interactive tips](https://observablehq.com/@observablehq/scatterplot-with-interactive-tips)

> :warning: Default interactive tooltips aren't currently supported in SveltePlot - see [Issue #101](https://github.com/svelteplot/svelteplot/issues/101)

```svelte
<script>
    import { Plot, Dot, RuleY } from 'svelteplot';
    import { page } from '$app/state';

    let { olympians } = $derived(page.data.data);
</script>

<Plot>
    <Dot
        data={olympians}
        x="weight"
        y="height"
        stroke="sex"
        channels={{
            name: 'name',
            sport: 'sport'
        }}
        tip={true} />
</Plot>
```

## [Proportional symbol scatterplot](https://observablehq.com/@observablehq/plot-proportional-symbol-scatterplot)

```svelte live
<script>
    import { Plot, Dot, RuleX } from 'svelteplot';
    import { page } from '$app/state';

    let { aapl } = $derived(page.data.data);
</script>

<Plot
    grid="true"
    x={{
        label: 'Daily change (%) →',
        tickFormat: '+f',
        percent: true
    }}
    y={{ type: 'log', label: '↑ Daily trading volume' }}>
    <RuleX data={[0]} />
    <Dot
        data={aapl}
        x={(d) => (d.Close - d.Open) / d.Open}
        y="Volume"
        r="Volume" />
</Plot>
```

## [Scatterplot with ordinal dimension](https://observablehq.com/@observablehq/plot-scatterplot-with-ordinal-dimension)

```svelte live
<script>
    import { Plot, Dot, RuleX } from 'svelteplot';
    import { page } from '$app/state';

    let { penguins } = $derived(page.data.data);
</script>

<Plot marginLeft={60} x={{ inset: 10 }} y={{ label: null }}>
    <Dot
        data={penguins}
        x="body_mass_g"
        y="species"
        stroke="sex" />
</Plot>
```

## [Ordinal scatterplot](https://observablehq.com/@observablehq/plot-ordinal-scatterplot)

> :warning: Grouping based on the `color` doesn't work - see [Issue #100](https://github.com/svelteplot/svelteplot/issues/100).
> The x-axis order is also reversed from Observable Plot.

```svelte live
<script>
    import { group, Plot, Dot } from 'svelteplot';
    import { page } from '$app/state';

    let { penguins } = $derived(page.data.data);
</script>

<Plot
    label="null"
    marginLeft={60}
    height={240}
    grid="true"
    r={{ range: [0, 40] }}>
    <Dot
        {...group(
            {
                data: penguins,
                x: 'species',
                y: 'island',
                stroke: 'sex'
            },
            { r: 'count' }
        )} />
</Plot>
```

## [Linear regression](https://observablehq.com/@observablehq/plot-linear-regression-simpson)

> :warning: Observable Plot calls this mark _linearRegressionY_ rather than _RegressionY_ - see [Issue #91](https://github.com/svelteplot/svelteplot/issues/91)

```svelte live
<script>
    import {
        Plot,
        Dot,
        RuleX,
        RegressionY
    } from 'svelteplot';
    import { page } from '$app/state';

    let { penguins } = $derived(page.data.data);
</script>

<Plot grid="true" color={{ legend: true }}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fill="species" />
    <RegressionY
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="species" />
    <RegressionY
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm" />
</Plot>
```

## [Dot heatmap](https://observablehq.com/@observablehq/plot-dot-heatmap)

```svelte live
<script>
    import { bin, Plot, Dot } from 'svelteplot';
    import { page } from '$app/state';

    let { olympians } = $derived(page.data.data);
</script>

<Plot r={{ range: [0, 6] }}>
    <Dot
        {...bin(
            {
                data: olympians,
                x: 'weight',
                y: 'height',
                stroke: 'sex'
            },
            {
                r: 'count'
            }
        )} />
</Plot>
```

## [Hexbin heatmap](https://observablehq.com/@observablehq/plot-olympians-hexbin)

> :warning: Svelte Plot doesn't have a Hexagon mark, or hexbin transform. See [Issue #80](https://github.com/svelteplot/svelteplot/issues/80).

```svelte
<script>
    import { hexbin, Plot, Hexagon } from 'svelteplot';
    import { page } from '$app/state';

    let { olympians } = $derived(page.data.data);
</script>

<Plot color={{ scheme: 'YlGnBu' }}>
    <Hexagon
        {...hexbin(
            {
                data: olympians,
                x: 'weight',
                y: 'height',
                symbol: 'square'
            },
            {
                fill: 'count'
            }
        )} />
</Plot>
```

## [Dodge cars (beeswarm)](https://observablehq.com/@observablehq/plot-dodge-cars)

> :warning: Svelte Plot doesn't have a dodgeY transform.
> See [Issue #16](https://github.com/svelteplot/svelteplot/issues/16).

```svelte
<script>
    import { dodgeY, Plot, DotX } from 'svelteplot';
    import { page } from '$app/state';

    let { cars } = $derived(page.data.data);
</script>

<Plot height={160}>
    <DotX
        {...dodgeY(
            { data: cars },
            {
                x: 'weight (lb)',
                title: 'name',
                fill: 'currentColor',
                anchor: anchor ?? undefined
            }
        )} />
</Plot>
```

## [2D faceting](https://observablehq.com/@observablehq/plot-two-dimensional-faceting)

> :warning: Unlike Observable Plot, silently drops 11 penguins where sex is `null`, so only plots 2 columns.
> See [Issue #99](https://github.com/svelteplot/svelteplot/issues/99)

```svelte live
<script>
    import { Plot, Dot, Frame } from 'svelteplot';
    import { page } from '$app/state';

    let { penguins } = $derived(page.data.data);

    //  console.log(penguins.filter(p => !p.sex))
</script>

<Plot grid="true" marginRight={60} facet={{ label: null }}>
    <Frame />
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fx="sex"
        fy="species" />
</Plot>
```

## [Non-faceted marks](https://observablehq.com/@observablehq/plot-non-faceted-marks)

> :warning: Unlike Observable Plot, silently drops 11 penguins where sex is `null`, so only plots 2 columns.
> See [Issue #99](https://github.com/svelteplot/svelteplot/issues/99)

```svelte live
<script>
    import { Plot, Dot, Frame } from 'svelteplot';
    import { page } from '$app/state';

    let { penguins } = $derived(page.data.data);

    //  console.log(penguins.filter(p => !p.sex))
</script>

<Plot grid="true" marginRight={60} facet={{ label: null }}>
    <Frame />
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fill="#aaa"
        r={1} />
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fx="sex"
        fy="species" />
</Plot>
```

## [Dot histogram](https://observablehq.com/@observablehq/plot-dot-bins)

> :warning: This works in Observable Plot, but SveltePlot complains that the channel `y` is not specified.
> See [Issue #98](https://github.com/svelteplot/svelteplot/issues/98)

```svelte
<script>
    import { binX, Plot, Dot, Frame } from 'svelteplot';
    import { page } from '$app/state';

    let { olympians } = $derived(page.data.data);
</script>

<Plot r={{ range: [0, 14] }}>
    <Dot
        {...binX(
            { data: olympians, x: 'weight' },
            { r: 'count' }
        )} />
</Plot>
```

This can be fixed by explicitly specifying `y: 0`:

```svelte live
<script>
    import { binX, Plot, Dot, Frame } from 'svelteplot';
    import { page } from '$app/state';

    let { olympians } = $derived(page.data.data);
</script>

<Plot r={{ range: [0, 14] }}>
    <Dot
        {...binX(
            { data: olympians, x: 'weight', y: 0 },
            { r: 'count' }
        )} />
</Plot>
```
