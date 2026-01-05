---
title: Stack transform
---

The **stack transform** comes in two orientations: [stackY](/transforms/stack#stackY) replaces **y** with **y1** and **y2** to form vertical↑ stacks grouped on **x**, while [stackX](/transforms/stack#stackX) replaces **x** with **x1** and **x2** for horizontal→ stacks grouped on **y**. In effect, stacking transforms a _length_ into _lower_ and _upper_ positions: the upper position of each element equals the lower position of the next element in the stack. Stacking makes it easier to perceive a total while still showing its parts.

For example, below is a stacked area chart of [deaths in the Crimean War](https://en.wikipedia.org/wiki/Florence_Nightingale#Crimean_War) — predominantly from disease — using Florence Nightingale’s data.

```svelte live
<script lang="ts">
    import { Plot, AreaY } from 'svelteplot';

    import { page } from '$app/state';
    let { crimea } = $derived(page.data.data);
</script>

<Plot grid color={{ legend: true }}>
    <AreaY data={crimea} x="date" y="deaths" fill="cause" />
</Plot>
```

```svelte
<Plot grid color={{ legend: true }}>
    <AreaY data={crimea} x="date" y="deaths" fill="cause" />
</Plot>
```

The [AreaY mark](/marks/area) applies the stackY transform implicitly if you do not specify either **y1** or **y2**. The same applies to [BarY](/marks/bar) and [RectY](/marks/rect). You can invoke the stack transform explicitly to produce an identical chart.

```svelte live
<script lang="ts">
    import { Plot, Area, stackY } from 'svelteplot';

    import { page } from '$app/state';
    let { crimea } = $derived(page.data.data);
</script>

<Plot grid color={{ legend: true }}>
    <Area
        {...stackY({
            data: crimea,
            x1: 'date',
            y: 'deaths',
            fill: 'cause'
        })} />
</Plot>
```

```svelte
<script>
    import { Plot, Area, stackY } from 'svelteplot';
</script>

<Plot grid color={{ legend: true }}>
    <Area
        {...stackY({
            data: crimea,
            x1: 'date',
            y: 'deaths',
            fill: 'cause'
        })} />
</Plot>
```

You can disable the implicit stacking by setting `y1` and `y2` channels explicitly.

```svelte live
<script lang="ts">
    import { Plot, AreaY } from 'svelteplot';

    import { page } from '$app/state';
    let { crimea } = $derived(page.data.data);
</script>

<Plot grid color={{ legend: true }}>
    <AreaY
        data={crimea}
        x="date"
        y1={0}
        y2="deaths"
        fill="cause"
        opacity={0.7} />
</Plot>
```

```svelte
<Plot grid color={{ legend: true }}>
    <AreaY
        data={crimea}
        x="date"
        y1={0}
        y2="deaths"
        fill="cause"
        opacity={0.7} />
</Plot>
```

The stack transform works with any mark that consumes y1 & y2 or x1 & x2, so you can stack rects, too.

```svelte --live
<script lang="ts">
    import { Plot, RectY } from 'svelteplot';

    import { page } from '$app/state';
    let { crimea } = $derived(page.data.data);
</script>

<Plot grid color={{ legend: true }}>
    <RectY
        data={crimea}
        x="date"
        y="deaths"
        fill="cause"
        interval="month" />
</Plot>
```

```svelte
<Plot grid color={{ legend: true }}>
    <RectY data={crimea} x="date" y="deaths" fill="cause" />
</Plot>
```

xxx

```svelte --live
<script lang="ts">
    import { Plot, Area, stackY } from 'svelteplot';

    import { page } from '$app/state';
    let { riaa } = $derived(page.data.data);
</script>

<Plot grid title="Stack transform">
    <Area
        fill="group"
        {...stackY({
            data: riaa,
            x1: 'year',
            y: 'revenue',
            z: 'format'
        })} />
</Plot>
```

You can pass options to the implicit stack transforms using the mark **stack** option:

```svelte live
<script>
    import {
        Plot,
        Rect,
        RectY,
        RuleY,
        binX,
        stackY
    } from 'svelteplot';

    import { page } from '$app/state';
    let { olympians } = $derived(page.data.data);
</script>

<Plot
    height={300}
    grid
    marginLeft={40}
    color={{ legend: true }}>
    <RectY
        {...binX(
            { data: olympians, x: 'weight', fill: 'sex' },
            { y: 'count' }
        )}
        stack={{ offset: 'center' }} />
    <RuleY data={[0]} />
</Plot>
```

```svelte
<Plot color={{ legend: true }}>
    <RectY
        {...binX(
            { data: olympians, x: 'weight', fill: 'sex' },
            { y: 'count' }
        )}
        stack={{ offset: 'center' }} />
</Plot>
```

## stackX

[API Reference](/api/transforms#stackX)

Replaces **x** with **x1** and **x2** for horizontal→ stacks grouped on **y**

## stackY

[API Reference](/api/transforms#stackY)

Replaces **y** with **y1** and **y2** to form vertical↑ stacks grouped on **x**.

## stackMosaicX

:::info
added in 0.4.0
:::

[API Reference](/api/transforms#stackMosaicX)

A mosaic or Marimekko chart is a stacked bar chart where the width of each bar is proportional to its total value. The `stackMosaic` transform computes both the horizontal stacking (x1, x2) and vertical stacking (y1, y2).

```js
stackMosaicX(
    {
        data: sales,
        x: 'market',
        y: 'segment',
        value: 'value'
    },
    {
        x: { percent: true },
        y: { percent: false }
    }
);
```

```svelte live
<script lang="ts">
    import {
        Plot,
        Rect,
        Text,
        stackMosaicX
    } from 'svelteplot';
    import { Checkbox } from '$lib/ui';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';

    const { sales } = $derived(
        page.data.data
    ) as ExamplesData;

    let xPercent = $state(true);
    let yPercent = $state(true);
    let sortValue = $state(false);

    const stacked = $derived(
        stackMosaicX(
            {
                data: sales,
                x: 'market',
                y: 'segment',
                value: 'value',
                ...(sortValue ? { sort: 'value' } : {})
            },
            {
                x: { percent: xPercent },
                y: { percent: yPercent }
            }
        )
    );
</script>

<Checkbox
    bind:value={xPercent}
    label="stack x percentages" />
<Checkbox
    bind:value={yPercent}
    label="stack y percentages" />
<Checkbox bind:value={sortValue} label="sort by value" />

<Plot
    x={{ percent: xPercent }}
    y={{ percent: yPercent }}
    height={500}
    marginBottom={50}
    marginTop={15}
    marginRight={15}>
    <Rect
        {...stacked}
        borderRadius={2}
        inset={1}
        opacity={0.5}
        fill="segment" />
    <Text
        {...stacked}
        fontSize={9}
        text={(d) =>
            [d.market, d.segment, d.value].join('\n')} />
</Plot>
```

[Fork](https://svelte.dev/playground/8426ef943f63404d8efd40831667ff9e?version=latest)

Channels:

- **data**: The input data array.
- **x**: The name of the categorical variable to group by on the x-axis.
- **y**: The name of the categorical variable to group by on the y-axis.
- **value**: The name of the quantitative variable to use for the size of each segment.
- **sort**: Optional. If 'value', sorts the x groups by total value descending.
- **filter**: Optional. A function to filter the data before stacking.

## stackMosaicY

:::info
added in 0.4.0
:::

[API Reference](/api/transforms#stackMosaicY)

Like `stackMosaicX`, but for vertical stacks where the height of each bar is proportional to its total value.

```svelte live
<script lang="ts">
    import {
        Plot,
        Rect,
        Text,
        stackMosaicY
    } from 'svelteplot';
    import { Checkbox } from '$lib/ui';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';

    const { sales } = $derived(
        page.data.data
    ) as ExamplesData;

    let xPercent = $state(true);
    let yPercent = $state(true);
    let sortValue = $state(false);

    const stacked = $derived(
        stackMosaicY(
            {
                data: sales,
                x: 'segment',
                y: 'market',
                value: 'value',
                ...(sortValue ? { sort: 'value' } : {})
            },
            {
                x: { percent: xPercent },
                y: { percent: yPercent }
            }
        )
    );
</script>

<Checkbox
    bind:value={xPercent}
    label="stack x percentages" />
<Checkbox
    bind:value={yPercent}
    label="stack y percentages" />
<Checkbox bind:value={sortValue} label="sort by value" />

<Plot
    x={{ percent: xPercent }}
    y={{ percent: yPercent }}
    marginTop={15}
    marginRight={15}>
    <Rect
        {...stacked}
        borderRadius={2}
        inset={1}
        opacity={0.5}
        fill="segment" />
    <Text
        {...stacked}
        fontSize={9}
        text={(d) =>
            [d.market, d.segment, d.value].join('\n')} />
</Plot>
```
