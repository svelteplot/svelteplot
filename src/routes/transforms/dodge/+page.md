---
title: Dodge transform
---

:::info
added in 0.5.0
:::

Given one position dimension (either x or y), the dodge transform computes the other position dimension such that dots are packed densely without overlapping. The `dodgeX` transform resolves overlapping by spreading objects horizontally, while the `dodgeY` transform spreads objects vertically.

The dodge transform is commonly used to produce beeswarm beeswarm plots, a way of showing a one-dimensional distribution that preserves the visual identity of individual data points. For example, the dots below represent the weights of cars.

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
