---
title: Density transform
---

The **density transform** turns a set of samples into a smooth probability density estimate using kernel density estimation (KDE). It evaluates the kernel at regularly spaced positions, normalizes by the bandwidth and sample size, and writes the resulting densities to a channel you choose (`y`/`y1`/`y2` for [densityX](#densityX), `x`/`x1`/`x2` for [densityY](#densityY)). Densities within each group integrate to 1, so they're handy for comparing distributions by fill, stroke, or facets.

:::info
Each group is formed from the current **fx**, **fy**, and **z** (or **fill**/**stroke**) channels before density is computed. This lets you facet densities or estimate one curve per category without manual filtering.
:::

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

<Plot grid y={{ label: 'Density', percent: true }}>
    <RuleY y={0} />
    <AreaY
        {...densityX(
            {
                data: olympians,
                x: 'weight',
                fill: 'sex'
            },
            { kernel, bandwidth, trim }
        )}
        fillOpacity={0.6} />
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

:::tip
For symmetric violins or mirrored ridgelines, send the density to `x2` (or `y2`) and set the corresponding baseline (`x1`/`y1`) to zero on the mark.
:::
