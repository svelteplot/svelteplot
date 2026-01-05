---
title: Dodge transform
---

:::info
added in 0.5.0
:::

Given one position dimension (either x or y), the dodge transform computes the other position dimension such that dots are packed densely without overlapping. The `dodgeX` transform resolves overlapping by spreading objects horizontally, while the `dodgeY` transform spreads objects vertically.

The dodge transform is commonly used to produce beeswarm beeswarm plots, a way of showing a one-dimensional distribution that preserves the visual identity of individual data points. For example, the dots below represent the weights of cars.

:::note
Unlike other transforms, the dodge transform is applied _after_ the positions have been computed using the scales. That's why you pass the dodge options via mark properties.
:::

```svelte live
<script>
    import { Plot, DotX, RuleY } from '$lib';
    import { page } from '$app/state';

    const { cars } = $derived(page.data.data);
</script>

<Plot
    height={(w) => Math.sqrt(1 / w) * 4700}
    inset={10}
    y={{ axis: false }}>
    <DotX
        data={cars}
        x="weight (lb)"
        dodgeY="bottom"
        fill />
</Plot>
```

```svelte
<Plot
    inset={5}
    y={{ axis: false }}
    height={(w) => Math.sqrt(1 / w) * 4700}>
    <DotX
        data={cars}
        x="weight (lb)"
        dodgeY="bottom"
        fill />
</Plot>
```

Compare this to a conventional histogram using a rect mark.

```svelte live
<script>
    import { Plot, RectY, RuleY, binX } from '$lib';
    import { page } from '$app/state';

    const { cars } = $derived(page.data.data);
</script>

<Plot height={(w) => Math.sqrt(1 / w) * 4700} inset={10}>
    <RectY
        {...binX(
            { data: cars, x: 'weight (lb)' },
            { y: 'count', thresholds: 20 }
        )} />
    <RuleY y={0} />
</Plot>
```

```svelte
<Plot inset={5} height={(w) => Math.sqrt(1 / w) * 4700}>
    <RectY
        {...binX(
            { data: cars, x: 'weight (lb)' },
            { y: 'count', thresholds: 20 }
        )} />
    <RuleY y={0} />
</Plot>
```

If you use the r channel to specify the radius of each dot, the dodge transform will take that into account when computing positions.

```svelte live
<script>
    import { Plot, Dot } from '$lib';
    import { page } from '$app/state';

    const { countries_2020: countries } = $derived(
        page.data.data
    );
    $inspect(countries);
</script>

<Plot
    height={(w) => Math.sqrt(1 / w) * 7e3}
    inset={10}
    color={{ legend: true }}
    r={{ range: [1, 40] }}
    x={{ type: 'log' }}
    y={{ axis: false }}>
    <Dot
        data={countries}
        x="Life expectancy"
        sort={{ channel: '-r' }}
        y={0}
        r="Population"
        dodgeY="middle"
        fill="Continent" />
</Plot>
```

This also works with other positional marks, such as texts:

```svelte live
<script>
    import { Plot, Dot, Text } from '$lib';
    import { page } from '$app/state';

    const { countries_2020: countries } = $derived(
        page.data.data
    );
    const dodgeY = { anchor: 'middle', padding: 3 };
</script>

<Plot
    height={(w) => Math.sqrt(1 / w) * 7e3}
    inset={15}
    r={{ range: [1, 40] }}
    x={{ type: 'log' }}
    y={{ axis: false }}>
    <Dot
        data={countries}
        x="Life expectancy"
        sort={{ channel: '-r' }}
        y={0}
        r="Population"
        {dodgeY}
        fill="Continent" />
    <Text
        data={countries}
        x="Life expectancy"
        r="Population"
        sort={{ channel: '-r' }}
        y={0}
        text="Code"
        fontSize={(d) =>
            Math.sqrt(d.Population / 1.4e9) * 33}
        {dodgeY}
        fill="var(--svelteplot-bg)" />
</Plot>
```

## dodgeX

The `dodgeX` transform computes the x position of dots to avoid overlap. The `dodgeX` option takes a string value that specifies how to align the dots vertically. The options are:

- **anchor** - Specifies how to align the dots horizontally within the plot area. The options are `left`, `middle`, and `right`.
- **padding** - Specifies the amount of padding (in pixels) to apply between dots. The default is `1` pixel.
- **r** - Specifies the radius (in pixels) of each dot, used in case the r channel is not specified. The default is `3` pixels.

## dodgeY

The `dodgeY` transform computes the y position of dots to avoid overlap. The `dodgeY` option takes a string value that specifies how to align the dots horizontally. The options are:

- **anchor** - Specifies how to align the dots horizontally within the plot area. The options are `top`, `middle`, and `bottom`.
- **padding** - Specifies the amount of padding (in pixels) to apply between dots. The default is `1` pixel.
- **r** - Specifies the radius (in pixels) of each dot, used in case the r channel is not specified. The default is `3` pixels.
