---
title: Group transform
---

The **group transform** groups ordinal or nominal data — discrete values such as name, type, or category. You can then compute summary statistics for each group, such as a count, sum, or proportion. The group transform is most often used to make bar charts with the [bar mark](/marks/bar).

For example, the bar chart below shows a distribution of Olympic athletes by sport.

```svelte live
<script>
    import { Plot, BarY, RuleY, groupX } from 'svelteplot';
    import { page } from '$app/state';
    let { olympians } = $derived(page.data.data);
</script>

<Plot
    x={{ tickRotate: -90 }}
    y={{ grid: true }}
    height={300}>
    <BarY
        {...groupX(
            { data: olympians, x: 'sport' },
            { y: 'count' }
        )} />
    <RuleY data={[0]} />
</Plot>
```

```svelte
<Plot x={{ tickRotate: -90 }} y={{ grid: true }}>
    <BarY
        {...groupX(
            { data: olympians, x: 'sport' },
            { y: 'count' }
        )} />
    <RuleY data={[0]} />
</Plot>
```

The groupX transform groups on **x**. The _outputs_ argument (here `y: "count"`) declares desired output channels (**y**) and the associated reducer (_count_). Hence the height of each bar above represents the number of Olympic athletes by sport.

While the groupX transform is often used to generate **y**, it can output to any channel. For example, by declaring **r** in _outputs_, we can generate dots of size proportional to the number of athletes in each sport.

```svelte live
<script>
    import { Plot, DotX, RuleY, groupX } from 'svelteplot';

    import { page } from '$app/state';
    let { olympians } = $derived(page.data.data);
</script>

<Plot
    x={{ tickRotate: -90 }}
    r={{ range: [0, 14] }}
    height={150}>
    <DotX
        {...groupX(
            { data: olympians, x: 'sport' },
            { r: 'count' }
        )} />
</Plot>
```

```svelte
<Plot x={{ tickRotate: -90 }} r={{ range: [0, 14] }}>
    <DotX
        {...groupX(
            { data: olympians, x: 'sport' },
            { r: 'count' }
        )} />
</Plot>
```

Grouping can be combined with the implicit stack transform of the bar marks:

```svelte live
<script lang="ts">
    import { Plot, BarX, groupY, RuleX } from 'svelteplot';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot
    x={{ axis: 'top' }}
    color={{ legend: true }}
    marginTop={40}>
    <RuleX data={[0]} />
    <BarX
        {...groupY(
            {
                data: penguins,
                y: 'island',
                fill: 'species'
            },
            { x: 'count' }
        )} />
</Plot>
```

```svelte
<Plot
    x={{ axis: 'top' }}
    color={{ legend: true }}
    marginTop={40}>
    <RuleX data={[0]} />
    <BarX
        {...groupY(
            {
                data: penguins,
                y: 'island',
                fill: 'species'
            },
            { x: 'count' }
        )} />
</Plot>
```

You can also group by temporal intervals

```svelte live
<script lang="ts">
    import { Plot, Line, groupX } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot grid height={300}>
    <Line data={aapl} x="Date" y="Close" opacity="0.5" />
    <Line
        {...groupX(
            { data: aapl, x: 'Date', y: 'Close' },
            { interval: 'month', y: 'mean' }
        )}
        stroke="var(--svp-red)"
        strokeWidth="2"
        curve="basis" />
</Plot>
```

```svelte
<Plot grid height={300}>
    <Line data={aapl} x="Date" y="Close" opacity="0.5" />
    <Line
        {...groupX(
            { data: aapl, x: 'Date', y: 'Close' },
            { interval: 'month', y: 'mean' }
        )}
        stroke="red"
        strokeWidth="2"
        curve="basis" />
</Plot>
```

[fork](https://svelte.dev/playground/8d65004eee1e4375b8b45b92e69f26cd?version=5)

## Group options

- **interval** - optional interval to group on, e.g. `2 weeks`
- **domain**
- **thresholds**
- **cumulative**
- **reverse** - reverses the cumulative grouping
- **copy** - copy attributes from first item of each group

## groupX

Groups on the _x_ channel as well as an additional _z_, _fill_, or _stroke_ channel to create new groups and compute output channels (mostly _y_, but can also be used for other channels).

```js
groupX({ data, x: 'sex' }, { y: 'count' });
```

## groupY

Groups on the _y_ channel as well as an additional _z_, _fill_, or _stroke_ channel to create new groups and compute output channels (mostly _x_, but can also be used for other channels).

```js
groupY({ data, y: 'sex' }, { x: 'count' });
```

## groupZ

Groups on the _z_, _fill_, or _stroke_ channel as an additional _x_ or _y_ channel to create new groups and compute output channels.

```svelte live
<script>
    import { Plot, Dot, groupZ, RuleY } from 'svelteplot';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot frame grid marginTop={35}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fx="species"
        opacity={0.35} />
    <RuleY
        {...groupZ(
            {
                data: penguins,
                y: 'culmen_depth_mm',
                fx: 'species'
            },
            { y: 'mean' }
        )}
        strokeWidth={2} />
</Plot>
```

```svelte
<Plot frame grid>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fx="species"
        opacity={0.35} />
    <RuleY
        {...groupZ(
            {
                data: penguins,
                y: 'culmen_depth_mm',
                fx: 'species'
            },
            { y: 'mean' }
        )}
        strokeWidth={2} />
</Plot>
```

## group

Groups on _x_ and _y_ channels as an additional _z_, _fill_, or _stroke_ channel to create new groups and compute output channels.

```svelte live
<script>
    import { group, Plot, Dot } from 'svelteplot';
    import { page } from '$app/state';
    let { sales } = $derived(page.data.data);
</script>

<Plot
    x={{ tickRotate: -45 }}
    r={{ range: [0, 20] }}
    inset={20}
    grid>
    <Dot
        {...group(
            {
                data: sales,
                x: 'market',
                y: 'segment',
                r: 'value'
            },
            { r: 'sum' }
        )}
        fill />
</Plot>
```

```svelte
<Plot x={{ tickRotate: -45 }} r={{ range: [0, 20] }} grid>
    <Dot
        {...group(
            {
                data: sales,
                x: 'market',
                y: 'segment',
                r: 'value'
            },
            { r: 'sum' }
        )}
        fill />
</Plot>
```
