---
title: Regression mark
---

Regressions are useful if you want to show the relationship between two variables. The following plot shows how the weight of cars depends on their power. The mark is using [d3-regression](https://github.com/harrystevens/d3-regression) for computing the regression lines.

```svelte live
<script lang="ts">
    import {
        Plot,
        Dot,
        RuleY,
        RegressionY
    } from 'svelteplot';
    import { page } from '$app/state';
    import { Select, Slider } from '$lib/ui';

    let { cars } = $derived(page.data.data);

    let type = $state('linear');
    let order = $state(3);
    let bandwidth = $state(0.3);
    let span = $state(0.7);
    let confidence = $state(0.99);
    const types = [
        'linear',
        'quad',
        'exp',
        'log',
        'pow',
        'loess'
    ];
</script>

<Select label="Type" bind:value={type} options={types} />
{#if type === 'poly'}<Slider
        label="order"
        bind:value={order}
        min={2}
        max={6} />{/if}
{#if type.startsWith('loess')}
    <Slider
        label="span"
        bind:value={span}
        min={0.1}
        max={2}
        step={0.01} />{/if}
<Select
    label="confidence:"
    bind:value={confidence}
    format={(d) => `${d * 100}%`}
    options={[0.8, 0.9, 0.95, 0.99, 0.999, 0.9999]} />

<Plot grid>
    <Dot
        data={cars}
        y="weight (lb)"
        x="power (hp)"
        symbol="plus"
        opacity={0.6} />
    <RegressionY
        data={cars}
        {type}
        {order}
        {span}
        {bandwidth}
        {confidence}
        stroke="var(--svp-red)"
        x="power (hp)"
        y="weight (lb)" />
</Plot>
```

Sometimes it's useful to look at regression within sub-groups of a dataset, since they can be different from the overall distribution.

```svelte live
<script>
    import { Plot, Dot, RegressionY } from 'svelteplot';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot
    grid
    height={500}
    color={{ legend: true }}
    testid="penguins">
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fill="species" />
    <RegressionY
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm" />
    <RegressionY
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="species" />
</Plot>
```

You can combine the regression mark with grouping _and_ faceting:

```svelte live
<script>
    import { Plot, Dot, RegressionY } from 'svelteplot';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot grid frame aspectRatio={1} inset={5}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fill="#999"
        opacity={0.2} />
    <Dot
        data={penguins}
        x="culmen_length_mm"
        fx="species"
        y="culmen_depth_mm"
        fill="species" />
    <RegressionY
        data={penguins}
        x="culmen_length_mm"
        fx="species"
        y="culmen_depth_mm"
        stroke="species" />
</Plot>
```

```svelte
<Plot grid frame aspectRatio={1} inset={5}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fill="#999"
        opacity={0.2} />
    <Dot
        data={penguins}
        x="culmen_length_mm"
        fx="species"
        y="culmen_depth_mm"
        fill="species" />
    <RegressionY
        data={penguins}
        x="culmen_length_mm"
        fx="species"
        y="culmen_depth_mm"
        stroke="species" />
</Plot>
```

## RegressionY

Returns a linear regression mark where y is the dependent variable and x is the independent variable. (This is the common orientation.)

```svelte live
<script lang="ts">
    import {
        Plot,
        Dot,
        RuleY,
        RegressionY
    } from 'svelteplot';
    import { page } from '$app/state';
    import { Select, Slider } from '$lib/ui';

    let { cars } = $derived(page.data.data);
</script>

<Plot grid>
    <Dot
        data={cars}
        y="weight (lb)"
        x="power (hp)"
        opacity={0.2} />
    <RegressionY
        data={cars}
        type="linear"
        stroke="var(--svp-blue)"
        y="weight (lb)"
        x="power (hp)" />
    <RegressionY
        data={cars}
        type="quad"
        stroke="var(--svp-red)"
        y="weight (lb)"
        x="power (hp)" />
</Plot>
```

```svelte
<Plot grid>
    <Dot
        data={cars}
        y="weight (lb)"
        x="power (hp)"
        opacity={0.2} />
    <RegressionY
        data={cars}
        type="linear"
        stroke="blue"
        y="weight (lb)"
        x="power (hp)" />
    <RegressionY
        data={cars}
        type="quad"
        stroke="red"
        y="weight (lb)"
        x="power (hp)" />
</Plot>
```

## RegressionX

Returns a linear regression mark where x is the dependent variable and y is the independent variable. (This is the uncommon orientation.)

```svelte live
<script lang="ts">
    import {
        Plot,
        Dot,
        RuleY,
        RegressionX
    } from 'svelteplot';
    import { page } from '$app/state';
    import { Select, Slider } from '$lib/ui';

    let { cars } = $derived(page.data.data);
</script>

<Plot grid>
    <Dot
        data={cars}
        y="weight (lb)"
        x="power (hp)"
        opacity={0.2} />
    <RegressionX
        data={cars}
        type="linear"
        stroke="var(--svp-blue)"
        y="weight (lb)"
        x="power (hp)" />
    <RegressionX
        data={cars}
        type="quad"
        stroke="var(--svp-red)"
        y="weight (lb)"
        x="power (hp)" />
</Plot>
```

```svelte
<Plot grid>
    <Dot
        data={cars}
        y="weight (lb)"
        x="power (hp)"
        opacity={0.2} />
    <RegressionX
        data={cars}
        type="linear"
        stroke="blue"
        y="weight (lb)"
        x="power (hp)" />
    <RegressionX
        data={cars}
        type="quad"
        stroke="red"
        y="weight (lb)"
        x="power (hp)" />
</Plot>
```

You can set `confidence` to `false` to omit the confidence band.
