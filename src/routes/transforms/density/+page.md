---
title: Density transform
---

:::info
added in 0.8.0
:::

The **density transform** turns a set of samples into a smooth probability density estimate using kernel density estimation (KDE). It's a smooth alternative to histograms when you want to compare distributions without choosing bin edges.

```svelte live
<script lang="ts">
    import { Plot, AreaY, densityX } from 'svelteplot';
    import RuleY from 'svelteplot/marks/RuleY.svelte';
    import { Select, Slider, Checkbox } from '$lib/ui';
    import { page } from '$app/state';

    let { olympians } = $derived(page.data.data);

    const kernels = [
        'epanechnikov',
        'gaussian',
        'uniform',
        'triangular',
        'quartic',
        'triweight',
        'cosine'
    ];
    let kernel = $state('epanechnikov');
    let trim = $state(false);
    let bandwidth = $state(3); // kilograms
</script>

<Select
    bind:value={kernel}
    options={kernels}
    label="Kernel" />
<Slider
    bind:value={bandwidth}
    min={1}
    max={10}
    step={0.1}
    label="Bandwidth (kg)" />
<Checkbox bind:value={trim} label="Trim" />

<Plot grid y={{ percent: true }}>
    <RuleY y={0} />
    <AreaY
        {...densityX(
            {
                data: olympians,
                x: 'weight',
                fill: 'sex'
            },
            { kernel, bandwidth, trim }
        )} />
</Plot>
```

[fork](https://svelte.dev/playground/06996438ec3944a1b07dcb53b8ba3537?version=5)

```svelte
<Plot grid y={{ percent: true }}>
    <RuleY y={0} />
    <AreaY
        {...densityX(
            {
                data: olympians,
                x: 'weight',
                fill: 'sex'
            },
            { kernel, bandwidth, trim }
        )} />
</Plot>
```

You can also display densities as lines, as in this example showing density curves for all four measurements in the iris dataset.

```svelte live
<script lang="ts">
    import { Plot, Line, densityX } from 'svelteplot';
    import RuleY from 'svelteplot/marks/RuleY.svelte';
    import { Slider } from '$lib/ui';
    import { page } from '$app/state';

    const measures = [
        { key: 'Sepal.Length', label: 'Sepal length' },
        { key: 'Sepal.Width', label: 'Sepal width' },
        { key: 'Petal.Length', label: 'Petal length' },
        { key: 'Petal.Width', label: 'Petal width' }
    ];

    let { iris } = $derived(page.data.data);

    const tidyIris = $derived(
        measures.flatMap(({ key, label }) =>
            iris.map((d) => ({
                Measurement: label,
                Value: d[key]
            }))
        )
    );
</script>

<Plot
    height={300}
    color={{ legend: true }}
    y={{ percent: true }}
    grid>
    <RuleY y={0} />
    <Line
        {...densityX(
            {
                data: tidyIris,
                x: 'Value',
                stroke: 'Measurement'
            },
            { bandwidth: 0.5 }
        )}
        strokeWidth={1.8} />
</Plot>
```

```svelte
<Plot
    height={300}
    color={{ legend: true }}
    y={{ percent: true }}
    grid>
    <RuleY y={0} />
    <Line
        {...densityX(
            {
                data: tidyIris,
                x: 'Value',
                stroke: 'Measurement'
            },
            { bandwidth: 0.5 }
        )}
        strokeWidth={1.8} />
</Plot>
```

Densities are computed at regular intervals along the x-axis (for densityX), defaulting to 1/5th of the bandwidth. You can adjust the **interval** option:

```svelte live
<script lang="ts">
    import { Plot, Line, densityX } from 'svelteplot';
    import RuleY from 'svelteplot/marks/RuleY.svelte';
    import { Slider } from '$lib/ui';
    import { page } from '$app/state';

    const measures = [
        { key: 'Sepal.Length', label: 'Sepal length' },
        { key: 'Sepal.Width', label: 'Sepal width' },
        { key: 'Petal.Length', label: 'Petal length' },
        { key: 'Petal.Width', label: 'Petal width' }
    ];

    let { iris } = $derived(page.data.data);

    const tidyIris = $derived(
        measures.flatMap(({ key, label }) =>
            iris.map((d) => ({
                Measurement: label,
                Value: d[key]
            }))
        )
    );

    let interval = $state(0.2);
</script>

<Slider
    bind:value={interval}
    min={0.1}
    max={0.5}
    step={0.01}
    label="Interval" />
<Plot
    height={300}
    color={{ legend: true }}
    y={{ percent: true }}
    grid>
    <RuleY y={0} />
    <Line
        {...densityX(
            {
                data: tidyIris,
                x: 'Value',
                stroke: 'Measurement'
            },
            { bandwidth: 0.5, interval }
        )}
        marker
        strokeWidth={1.8} />
</Plot>
```

You can use the **weight** option to compute weighted densities:

```svelte live
<script lang="ts">
    import { Plot, Line, densityX } from 'svelteplot';
    import RuleY from 'svelteplot/marks/RuleY.svelte';
    import { Slider } from '$lib/ui';
    import { page } from '$app/state';

    let { penguins } = $derived(page.data.data);
    let skew = $state(0);
</script>

<Slider
    bind:value={skew}
    min={-1}
    max={1}
    step={0.1}
    label="Skew (-F/+M)" />
<Plot
    height={300}
    color={{ legend: true }}
    x={{ domain: [2400, 6550], label: 'Body mass (g)' }}
    y={{ percent: true }}
    grid>
    <RuleY y={0} />
    <Line
        {...densityX(
            {
                data: penguins,
                x: 'body_mass_g',
                stroke: 'species',
                weight: (d) =>
                    d.sex === 'FEMALE' ? 1 - skew : 1 + skew
            },
            { bandwidth: 250 }
        )}
        strokeWidth={1.8} />
</Plot>
```

The default bandwidth uses Silverman's rule-of-thumb (scaled per kernel) so that curves roughly match the data's spread; in the live example above you can override it to see how smoother or more detailed densities behave. Because KDE is additive, this transform works well with stacked or layered areas, violin plots, and ridgelines.

KDE estimates a smooth density from samples $x_1,\dots,x_n$ by summing a kernel $K$ over a grid:

$$
\hat f(x) = \frac{1}{n h} \sum_{i=1}^n K\!\left(\frac{x - x_i}{h}\right)
$$

`densityX` evaluates this expression on a regularly spaced set of x positions and writes the result to a y-channel; `densityY` does the same with roles swapped. Choosing a wider bandwidth **h** produces smoother, less detailed curves; narrower bandwidths emphasize local bumps at the cost of noise.

## Options

- **kernel** - The default is efficient and near-optimal for many cases; try Gaussian when you prefer smooth tails. Possible kernels are `uniform`, `triangular`, `epanechnikov`, `quartic`, `triweight`, `gaussian` or `cosine`. You can also pass a custom `(u:number) => number` kernel function.
- **bandwidth** - Number (same units as the independent axis) or `(values) => number`. Defaults to Silverman's rule scaled for the chosen kernel. Larger values smooth more; smaller values reveal more local structure.
- **interval** - Numeric step or controlling where the density is evaluated. Defaults to a step of ~bandwidth/5 rounded to a terminating decimal.
- **trim** - When `false` (default) the domain is padded by 20% and leading/trailing zero rows are dropped so areas land cleanly at zero. Set to `true` to evaluate only over the observed extent without padding or trimming.
- **channel** - Target channel for the computed density (`'y' | 'y1' | 'y2'` for densityX, `'x' | 'x1' | 'x2'` for densityY). Useful when you need explicit lower/upper bounds for stacking or symmetrical plots.

## densityX

`densityX` keeps **x** as the independent axis and writes densities to the y side. It pairs naturally with [AreaY](/marks/area), [LineY](/marks/line), and other y-based marks.

```svelte
<Plot y={{ percent: true }} grid>
    <AreaY
        {...densityX(
            { data: olympians, x: 'weight', fy: 'sex' },
            { kernel: 'gaussian' }
        )}
        fill="sex"
        y1={0} />
</Plot>
```

## densityY

`densityY` mirrors the orientation: it smooths values in **y** and writes the density to the x side. This is handy for violins.

```svelte
<Plot
    inset={10}
    x={{ axis: false, percent: true }}
    y={{ label: 'Sepal length' }}
    grid
    frame>
    <AreaX
        {...densityY(
            {
                data: iris,
                y: 'Sepal.Length',
                fx: 'Species'
            },
            { channel: 'x2' }
        )}
        stack={{ offset: 'center' }}
        stroke="currentColor"
        fillOpacity={0.5} />
</Plot>
```

Tipp: you can use the center stacking offset to create violin-style plots.

```svelte live
<script lang="ts">
    import {
        Plot,
        AreaX,
        RuleX,
        densityY
    } from 'svelteplot';
    import { page } from '$app/state';
    let { cars } = $derived(page.data.data);
</script>

<Plot
    x={{
        axis: false,
        percent: true,
        insetLeft: 10,
        insetRight: 10
    }}
    y={{ grid: true }}
    fx={{ label: 'Cylinders', axis: 'bottom', padding: 0 }}>
    <RuleX x={0} opacity={0.5} />
    <AreaX
        {...densityY(
            {
                data: cars,
                y: 'weight (lb)',
                fx: 'cylinders'
            },
            { bandwidth: 350 }
        )}
        stack={{ offset: 'center' }}
        stroke="currentColor"
        fillOpacity={0.5} />
</Plot>
```

```svelte
<Plot
    x={{ axis: false, percent: true, label: 'Density' }}
    y={{ label: 'Weight (kg)', grid: true }}
    fx={{ label: 'Cylinders', axis: 'bottom' }}>
    <RuleX x={0} opacity={0.5} />
    <AreaX
        {...densityY(
            {
                data: cars,
                y: 'weight (lb)',
                fx: 'cylinders'
            },
            { bandwidth: 350 }
        )}
        stack={{ offset: 'center' }}
        stroke="currentColor"
        fillOpacity={0.5} />
</Plot>
```
