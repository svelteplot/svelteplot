---
title: Box mark
---

Box marks are a compound mark consisting of a bar, rule, dots and tick marks (see options)

```svelte live
<script>
    import { Plot, BoxX, BoxY } from 'svelteplot';
    import { Slider } from '$lib/ui';

    import { page } from '$app/state';
    let { countries } = $derived(page.data.data);

    let year = $state(2021);
    let filteredData = $derived(
        countries.filter(
            (d) =>
                Math.abs(d.Year - year) < 20 &&
                d.Continent &&
                d.Continent !== '#N/A'
        )
    );
</script>

<Slider
    label="year"
    min={1800}
    max={2021}
    bind:value={year} />

<Plot
    inset={5}
    color={{ legend: true }}
    x={{ type: 'log' }}>
    <BoxX
        data={filteredData}
        bar={{ fill: 'Continent', rx: 6 }}
        dot={{ stroke: 'Continent' }}
        tickMinMax
        tickMedian={{ stroke: 'var(--svelteplot-bg)' }}
        y="Continent"
        x="GDP per capita" />
</Plot>
```

## Options

You can style box plots by passing separate options for the marks

- **bar** - options passed to the inter-quartile range bar marks
- **rule** - options passed to the min/max range rule marks
- **dot** - options passed to the dot marks representing the outliers
- **tickMedian** - options passed to the tick marks representing the median
- **tickMinMax** - options passed to the tick marks representing the lower and upper quartiles
- **sort** - optional grouping sort; defaults to the `median`. Accepts `'min' | 'max' | 'median' | 'p25' | 'p75'` or a function receiving the first datum in the group _added in 0.9.0_

## BoxX

```svelte live
<script>
    import { Plot, BoxX } from 'svelteplot';
    import { page } from '$app/state';
    let { mpg } = $derived(page.data.data);
</script>

<Plot x={{ grid: true }}>
    <BoxX
        data={mpg}
        x="hwy"
        tickMinMax
        y="class"
        sort="median"
        dot={{ fill: true }}
        bar={{
            stroke: 'currentColor'
        }} />
</Plot>
```

```svelte
<Plot x={{ grid: true }}>
    <BoxX
        data={mpg}
        x="hwy"
        tickMinMax
        y="class"
        sort="median"
        dot={{ fill: true }}
        bar={{ stroke: 'currentColor' }} />
</Plot>
```

## BoxY

```svelte live
<script>
    import { Plot, BoxY } from 'svelteplot';
    import { page } from '$app/state';
    let { mpg } = $derived(page.data.data);
</script>

<Plot grid>
    <BoxY
        data={mpg}
        x="class"
        y="hwy"
        sort="min"
        tickMedian={{
            stroke: 'var(--svelteplot-bg)',
            strokeWidth: 3
        }} />
</Plot>
```

```svelte
<Plot grid>
    <BoxY
        data={mpg}
        x="class"
        y="hwy"
        sort="min"
        tickMedian={{
            stroke: 'var(--svelteplot-bg)',
            strokeWidth: 3
        }} />
</Plot>
```
