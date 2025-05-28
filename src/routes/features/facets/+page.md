---
title: Facets
---

Facets are a way to split a plot into multiple panels.

```svelte live
<script>
    import { Plot, Dot, AxisX } from '$lib/index';
    import { page } from '$app/state';
    const { penguins } = $derived(page.data.data);
</script>

{#if penguins.length}
    <Plot
        frame
        grid
        height={600}
        inset={10}
        marginTop={35}
        marginBottom={40}>
        <Dot
            data={penguins}
            x="culmen_length_mm"
            y="culmen_depth_mm"
            r={2}
            opacity={0.1} />
        <Dot
            data={penguins}
            x="culmen_length_mm"
            y="culmen_depth_mm"
            fy="species"
            fx="sex" />
    </Plot>
{/if}
```

```svelte
<Plot frame grid height={600} inset={10} margins={30}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        r={2}
        opacity={0.1} />
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="species"
        fy="island"
        fx="sex" />
</Plot>
```

[Fork](https://svelte.dev/playground/fe8b6ab8f5ea4e06a6d733d1eae71f52?version=5)

Here's a histogram of Olympian athlete weights faceted by sex:

```svelte live
<script>
    import { Plot, RectY, RuleY, binX } from 'svelteplot';
    import { page } from '$app/state';
    let { olympians } = $derived(page.data.data);
</script>

<Plot grid height={300}>
    <RectY
        {...binX(
            { data: olympians, x: 'weight', fy: 'sex' },
            { y: 'count' }
        )} />
    <RuleY y="0" />
</Plot>
```

```svelte
<Plot grid>
    <RectY
        {...binX(
            { data: olympians, x: 'weight', fy: 'sex' },
            { y: 'count' }
        )} />
    <RuleY y={0} />
</Plot>
```

[Fork](https://svelte.dev/playground/f01016597a854ec3ad4b38f901a513ec?version=5)

Apply top-level facet options automatically:

```svelte --live
<script>
    import { Plot, Dot, Frame } from '$lib/index';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

{#if penguins.length}
    <Plot
        grid
        height={600}
        inset={10}
        margins={30}
        facet={{ data: penguins, x: 'sex', y: 'island' }}>
        <Frame />
        <Dot
            data={penguins}
            x="culmen_length_mm"
            y="culmen_depth_mm"
            facet="exclude"
            r={2}
            opacity={0.1} />
        <Dot
            data={penguins}
            x="culmen_length_mm"
            y="culmen_depth_mm"
            stroke="species" />
    </Plot>
{/if}
```

Bar chart facets

```svelte live
<script>
    import { Plot, BarY } from '$lib/index';
    const resultsLong = [
        { party: 'Union', year: 2025, percent: 30 },
        { party: 'Union', year: 2021, percent: 22 },
        { party: 'SPD', year: 2025, percent: 20 },
        { party: 'SPD', year: 2021, percent: 27 },
        { party: 'Grüne', year: 2025, percent: 16 },
        { party: 'Grüne', year: 2021, percent: 21 },
        { party: 'FDP', year: 2025, percent: 6 },
        { party: 'FDP', year: 2021, percent: 12 },
        { party: 'Linke', year: 2025, percent: 4 },
        { party: 'Linke', year: 2021, percent: 7 }
    ];
</script>

<Plot
    x={{ label: ' ' }}
    y={{ label: '' }}
    opacity={{ range: [0.4, 1] }}
    fx={{
        axis: 'bottom',
        axisProps: { fontWeight: 'bold', tickFontSize: 13 },
        axisOptions: { dy: 20 }
    }}>
    <BarY
        data={resultsLong}
        x="year"
        y="percent"
        dx={(d) => (d.year === 2021 ? 10 : -10)}
        fx="party"
        fill="party"
        opacity="year" />
</Plot>
```
