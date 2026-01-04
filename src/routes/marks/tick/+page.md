---
title: Tick mark
---

Ticks are useful for showing one-dimensional distributions, as in the "barcode" plot below. The secondary dimension must be a band scale.

## TickX

[API Reference](/api/marks#TickX)

The tickX mark shows a vertical bar for each x position. Based on an example from [Observable Plot](https://observablehq.com/@observablehq/plot-barcode), this chart shows the age distribution of the population in each US state as horizontal ticks. The x position of each tick represents the share of the state's population in that age group.

```svelte live
<script lang="ts">
    import { Plot, RuleX, TickX } from '$lib/index.js';
    import { page } from '$app/state';
    let { stateage } = $derived(page.data.data);
</script>

<Plot x={{ grid: true, percent: true }}>
    <RuleX data={[0]} />
    <TickX data={stateage} y="age" x="pop_share" />
</Plot>
```

```svelte
<Plot x={{ grid: true, percent: true }}>
    <RuleX data={[0]} />
    <TickX data={stateage} y="age" x="pop_share" />
</Plot>
```

## TickY

[API Reference](/api/marks#TickY)

Shows a horizontal bar for each x position.

```svelte live
<script lang="ts">
    import { Plot, RuleY, TickY } from '$lib/index.js';
    import { Slider } from '$lib/ui';
    import { page } from '$app/state';
    let { stateage } = $derived(page.data.data);

    let padding = $state(0.3);
    let align = $state(0.5);
</script>

<Slider
    label="padding"
    bind:value={padding}
    min={0}
    max={1}
    step={0.01} />
<Slider
    label="align"
    bind:value={align}
    min={0}
    max={1}
    step={0.01} />

<Plot
    x={{ padding, align }}
    y={{ grid: true, percent: true }}>
    <RuleY data={[0]} />
    <TickY data={stateage} x="age" y="pop_share" />
</Plot>
```

```svelte
<Plot y={{ grid: true, percent: true }}>
    <RuleY data={[0]} />
    <TickY data={stateage} x="age" y="pop_share" />
</Plot>
```

Same idea but with facet:

```svelte live
<script lang="ts">
    import { Plot, RuleY, TickY } from '$lib/index.js';

    import { page } from '$app/state';
    const { stateage } = $derived(page.data.data);
</script>

<Plot y={{ grid: true, percent: true }}>
    <RuleY data={[0]} />
    <TickY data={stateage} fx="age" y="pop_share" />
</Plot>
```

```svelte
<Plot y="{{ grid: true, percent: true }}}">
    <RuleY data={[0]} />
    <TickY data={stateage} fx="age" y="pop_share" />
</Plot>
```
