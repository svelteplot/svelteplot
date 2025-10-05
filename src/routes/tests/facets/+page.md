---
title: Testing facets
---

Facetted **area** chart:

```svelte live
<script lang="ts">
    import { Plot, AreaY, RuleY } from '$lib/index.js';
    import { page } from '$app/state';
    let { riaa } = $derived(page.data.data);
</script>

<Plot
    testid="area"
    grid
    y={{ insetTop: 10 }}
    height={700}
    marginRight={100}>
    <AreaY
        data={riaa}
        x="year"
        y="revenue"
        fill="format"
        fy="group" />
    <RuleY data={[0]} />
</Plot>
```

Facetted **arrow** chart:

Facetted **barX** chart:

Facetted **barY** chart:

Facetted **cell** chart:

Facetted **dot** chart:

```svelte live
<script>
    import { Plot, Dot, AxisX } from '$lib/index';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

{#if penguins.length}
    <Plot
        testid="dot"
        frame
        grid
        height={600}
        inset={10}
        margin={30}
        marginTop={35}
        marginBottom={40}
        marginRight={70}>
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

Facetted **line** chart:

```svelte live
<script lang="ts">
    import { Plot, LineY, RuleY } from '$lib/index.js';
    import { page } from '$app/state';
    let { riaa } = $derived(page.data.data);
</script>

<Plot
    testid="line"
    grid
    y={{ insetTop: 10 }}
    height={700}
    marginRight={100}>
    <LineY
        data={riaa}
        x="year"
        y="revenue"
        stroke="format"
        fy="group" />
    <RuleY data={[0]} />
</Plot>
```

Facetted **rectX** chart

```svelte live
<script lang="ts">
    import {
        Plot,
        RectX,
        RuleX,
        binY
    } from '$lib/index.js';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot grid testid="rectx">
    <RectX
        {...binY(
            {
                data: penguins,
                y: 'body_mass_g',
                fill: 'sex',
                fx: 'sex'
            },
            { x: 'count', interval: 200 }
        )} />
    <RuleX data={[0]} />
</Plot>
```

Facetted **rectY** chart

```svelte live
<script lang="ts">
    import {
        Plot,
        RectY,
        RuleY,
        binX
    } from '$lib/index.js';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot grid testid="recty" marginRight={80}>
    <RectY
        {...binX(
            {
                data: penguins,
                x: 'body_mass_g',
                fill: 'sex',
                fy: 'sex'
            },
            { y: 'count', interval: 200 }
        )} />
    <RuleY data={[0]} />
</Plot>
```

Facetted **regression** chart

```svelte live
<script>
    import { Plot, Dot, RegressionY } from 'svelteplot';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot
    grid
    testid="regression"
    frame
    aspectRatio={1}
    inset={5}>
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

Facetted **ruleX** chart

```svelte live
<script>
    import { Plot, Dot, RuleX } from 'svelteplot';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot
    frame
    height={200}
    marginLeft={5}
    inset={5}
    marginRight={100}
    testid="rulex">
    <!-- <Dot data={penguins} x="culmen_length_mm" y="culmen_depth_mm" fill="#999" opacity={0.2} /> -->
    <RuleX
        data={penguins}
        fy="species"
        stroke="island"
        x="culmen_depth_mm" />
</Plot>
```

Facetted **ruleY** chart

```svelte live
<script>
    import { Plot, Dot, RuleY } from 'svelteplot';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot
    frame
    marginBottom={5}
    maxWidth="200px"
    inset={5}
    testid="ruley">
    <!-- <Dot data={penguins} x="culmen_length_mm" y="culmen_depth_mm" fill="#999" opacity={0.2} /> -->
    <RuleY
        data={penguins}
        fx="species"
        stroke="island"
        y="culmen_depth_mm" />
</Plot>
```

Facetted **text** chart

```svelte live
<script>
    import { Plot, Text, AxisX } from '$lib/index';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

{#if penguins.length}
    <Plot
        testid="text"
        frame
        grid
        height={600}
        inset={10}
        margin={30}
        marginTop={35}
        marginBottom={40}
        marginRight={70}>
        <Text
            data={penguins}
            x="culmen_length_mm"
            y="culmen_depth_mm"
            text={(d) => d.island.charAt(0)}
            opacity={0.1} />
        <Text
            data={penguins}
            x="culmen_length_mm"
            y="culmen_depth_mm"
            text={(d) => d.island.charAt(0)}
            fy="species"
            fx="sex" />
    </Plot>
{/if}
```

Facetted **tick** chart
