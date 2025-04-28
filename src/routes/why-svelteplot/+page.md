---
title: Why SveltePlot?
description: Why do we need yet another Svelte visualization framework?
---

SveltePlot combines the concise API and concepts of Observable Plot with Svelte reactivity. It is not just a Svelte-wrapper, but re-implemented from scratch on top of D3. But what makes SveltePlot better than the existing visualization frameworks in Svelte?

## Layered grammar of graphics

In contrast to [other](https://unovis.dev/docs/quick-start) [frameworks](https://www.layerchart.com/) SveltePlot is following the ideas of _[layered grammar of graphics](https://vita.had.co.nz/papers/layered-grammar.html)_ style frameworks like [ggplot2](https://ggplot2.tidyverse.org/), [VegaLite](https://vega.github.io/vega-lite/) or [Observable Plot](https://observablehq.com/plot/what-is-plot).

This means there is no "scatterplot" component in SveltePlot, but you can use the [Dot mark](/marks/dot) to create a scatterplot:

```svelte live
<script>
    import { Plot, Dot } from '$lib';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot grid color={{ legend: true }} testid="penguins">
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="species"
        symbol="species" />
</Plot>
```

```svelte
<Plot grid color={{ legend: true }}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="species"
        symbol="species" />
</Plot>
```

[fork](https://svelte.dev/playground/ec6da6d3ab314edd89ef038281b419c5?version=5.14.0)

You can think of marks as the building blocks for your visualizations -- or the _nouns_ in your visual language, to stick with the grammar metaphor. We can use the exact same Dot we used for the above scatterplot to create a symbol map, a bubble heatmap, or a Cleveland-style dot plot:

```svelte live
<script>
    import { Plot, Dot, GridY, AxisX } from '$lib';
    import { page } from '$app/state';
    const { languages } = $derived(page.data.data);
</script>

<Plot
    x={{
        type: 'log',
        insetLeft: 20,
        insetRight: 20,
        axis: 'top'
    }}
    y={{ type: 'point', label: '' }}>
    <GridY strokeDasharray="1,3" strokeOpacity="0.5" />
    <Dot
        data={languages.filter(
            (d) => d['Total speakers'] >= 90e6
        )}
        x="Total speakers"
        y="Language"
        fill
        sort={{ channel: '-x' }} />
</Plot>
```

```svelte
<Plot
    x={{
        type: 'log',
        insetLeft: 20,
        insetRight: 20,
        axis: 'top'
    }}
    y={{ type: 'point', label: '' }}>
    <!-- dotted lines for grid -->
    <GridY strokeDasharray="1,3" strokeOpacity="0.3" />
    <!-- and the dots: -->
    <Dot
        data={languages}
        x="Total speakers"
        y="Language"
        fill
        sort={{ channel: '-x' }} />
</Plot>
```

[fork](https://svelte.dev/playground/b329bb028a5445ba8f884291f0475be6?version=5.15.0)

This makes it a lot easier to iterate over different ideas for visualizations. For instance, if we want to combine the dot plot above with a line chart, we can just throw in a Line mark as extra layer.

```svelte live
<script>
    import { Plot, Dot, Line, GridY } from '$lib';
    import { page } from '$app/state';
    let { languages: allLanguages } = $derived(
        page.data.data
    );
    const languages = $derived(
        allLanguages.filter(
            (d) => d['Total speakers'] >= 90e6
        )
    );
</script>

<Plot
    x={{
        type: 'log',
        axis: 'top',
        insetLeft: 20,
        insetRight: 20
    }}
    y={{ type: 'point', label: '' }}>
    <GridY strokeDasharray="1,3" strokeOpacity="0.3" />
    <Line
        opacity={0.5}
        data={languages}
        x="Total speakers"
        y="Language" />
    <Dot
        data={languages}
        x="Total speakers"
        y="Language"
        fill
        sort={{ channel: '-x' }} />
</Plot>
```

```svelte
<Plot /* ... */ >
    <GridY strokeDasharray="1,3" strokeOpacity="0.3" />
    <Line
        data={languages}
        x="Total speakers"
        y="Language"
        opacity={0.5}/>
    <Dot
        data={languages}
        x="Total speakers"
        y="Language"
        fill
        sort={{ channel: '-x' }} />
</Plot>
```

And if we wanted to add uncertainty ranges, we can add a rule mark as well.

```svelte live
<script>
    import { Plot, Dot, Line, GridY, RuleY } from '$lib';
    import { page } from '$app/state';

    let { languages: allLanguages } = $derived(
        page.data.data
    );
    const languages = $derived(
        allLanguages.filter(
            (d) => d['Total speakers'] >= 90e6
        )
    );
</script>

<Plot
    x={{
        type: 'log',
        axis: 'top',
        insetLeft: 20,
        insetRight: 20
    }}
    y={{ type: 'point', label: '' }}>
    <GridY strokeDasharray="1,3" strokeOpacity="0.3" />
    <Line
        opacity={0.5}
        data={languages}
        x="Total speakers"
        y="Language" />
    <RuleY
        data={languages}
        y="Language"
        x1={(d) =>
            d['Total speakers'] - d['First-language'] * 0.2}
        x2={(d) =>
            d['Total speakers'] +
            d['First-language'] * 0.2} />
    <Dot
        data={languages}
        x="Total speakers"
        y="Language"
        fill
        sort={{ channel: '-x' }} />
</Plot>
```

[fork](https://svelte.dev/playground/7bf86302c8b64e749c9b2d44bac2832c?version=5.14.0)

Would you still call this a dot plot or is it a line chart already? Perhaps a dot-line-range chart? The beauty of grammar of graphics style frameworks that _it doesn't matter_ how you call your plot! We can create tons of chart variations without having to "switch" the chart template or go through a list of special options in existing templates. Instead, we can just mix the marks and transforms in SveltePlot!

## Plotting in pure Svelte 5

If [Observable Plot](https://observablehq.com/plot/) is so great, why not just use it and the [recommended Svelte wrapper](https://observablehq.com/plot/getting-started#plot-in-svelte)? The short answer: because it's not the Svelte way!

Observable Plot follows a fire-and-forget logic: You pass your config options to `Plot.plot()` and it returns a static SVG element with the chart (see the official [documentation](https://observablehq.com/plot/features/interactions#custom-reactivity)). Whenever you make changes to a chart config, the next render call will throw away the entire SVG DOM and replace it with a new one.

In contrast, in **SveltePlot** the plot and mark components are _Svelte components_, so the _data_ and _channel_ definitions are just the props you pass to them. Whenever you change a channel assignment or the data array, the plot will update itself, re-using the existing DOM.

Take the following example, where you can filter the data using the [filter](/transforms/filter/) transform, which is bound to a range input. When the plot updates, only the affected `<path>` elements get updated while the rest remains in the DOM:

```svelte live
<script>
    import { Plot, Dot } from '$lib';
    import { Slider } from '$lib/ui';
    import { page } from '$app/state';
    const { cars } = $derived(page.data.data);
    let min = $state(0);
    let noAxisX = $state(false);
    let noAxisTitle = $state(false);
</script>

<Slider
    bind:value={min}
    label="min economy (mpg)"
    max={50} />

<Plot grid testid="cars" color={{ type: 'linear' }}>
    <Dot
        data={cars}
        filter={(d) => d['economy (mpg)'] > min}
        y="weight (lb)"
        x="power (hp)"
        r={4}
        stroke="economy (mpg)" />
</Plot>
```

Here's an example where we're binding a live-updated dataset to a line mark. Note how the `<path>` elements rendering the line and area get re-used, and ticks and grid lines get moved around instead of being re-created on every frame:

```svelte live
<script lang="ts">
    import {
        Plot,
        LineY,
        RuleY,
        AreaY,
        Dot,
        Text
    } from '$lib/index.js';
    import { noise } from '$lib/helpers/noise.js';

    let rand: number[] = $state([]);
    let maxLen = $state(200);

    const S = Math.ceil(Math.random() * 1e7);

    // const rand = range(400).map(i => ({ x: i - 200, y: noise(i/20) * 200 - 100 }))
    let mag = $state(1);

    function addLine() {
        do {
            const prevI = rand.length ? rand.at(-1).x : 200;
            mag = Math.pow(
                10,
                Math.floor(Math.log10(prevI) - 2)
            );
            const i = prevI + mag;
            const pt = {
                x: i,
                y:
                    (noise(i / 40 / mag) * 100 - 50) *
                    Math.log10(mag * 10) *
                    5
            };
            rand = [...rand.slice(-maxLen), pt];
        } while (rand.length < 150);
        window.requestAnimationFrame(addLine);
    }

    $effect(async () => {
        if (!rand.length) addLine();
    });
</script>

<Plot
    grid
    marginRight={10}
    marginLeft={35 + Math.log10(mag) * 5}
    inset={10}
    y={{ tickSpacing: 30, nice: true }}
    x={{ tickSpacing: 90, insetRight: 30 }}
    color={{ type: 'categorical' }}
    height={250}>
    <RuleY data={[0]} />
    {#if rand.length > 1}
        <AreaY
            data={rand}
            x="x"
            y="y"
            fill="currentColor"
            opacity={0.1} />
        <LineY
            data={rand}
            x="x"
            y="y"
            stroke="currentColor" />
        <Dot
            data={[rand.at(-1)]}
            x="x"
            y="y"
            fill="currentColor" />
        <Text
            data={[rand.at(-1)]}
            x="x"
            y="y"
            fontWeight="bold"
            stroke="var(--svelteplot-bg)"
            strokeWidth={3}
            fill="currentColor"
            textAnchor="start"
            dx={6}
            text={(d) => d.y.toFixed(0)} />
    {/if}
</Plot>
```

[fork](https://svelte.dev/playground/e136cdefec7943cba5e6d7b604a2e50c?version=5.14.0)

Also, simply by being a Svelte framework, SveltePlot can support tweens and transitions! In the following plot, we're using the [Tween state](https://svelte.dev/docs/svelte-motion#Tween) from `svelte/motion` to smoothly update the vertical domain whenever the data changes.

```svelte live
<script>
    import { Plot, RuleY, BarY } from '$lib';
    import { Tween } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    import { extent } from 'd3-array';
    import { fade } from 'svelte/transition';

    let data = $state([1, 2, 3, 4, 5]);

    const domain = Tween.of(() => extent([0, ...data]), {
        duration: 1000,
        easing: cubicOut
    });
</script>

<Plot
    color={{ scheme: 'reds' }}
    x={{ axis: false, padding: data.length < 60 ? 0.1 : 0 }}
    y={{ grid: true, domain: domain.current }}>
    <BarY
        {data}
        fill={(d) => d}
        cursor="pointer"
        onclick={(e, d, index) => {
            data[index] += 0.2 * data[index];
        }} />
    <RuleY data={[0]} />
</Plot>
```

```svelte
<script>
    import { Tween } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';

    let data = $state([1, 2, 3, 4, 5]);

    const domain = new Tween.of(
        () => extent([0, ...data]),
        {
            duration: 1000,
            easing: cubicOut
        }
    );
</script>

<Plot
    color={{ scheme: 'RdBu' }}
    y={{ grid: true, domain: domain.current }}>
    <BarY
        {data}
        onclick={(evt, d, index) => {
            data[index] += 0.2 * data[index];
        }} />
    <RuleY data={[0]} />
</Plot>
```

[fork](https://svelte.dev/playground/5f3acc2b098e4490b09f679218c4cb2d?version=5.28.2)

## Easy to extend

You can extend SveltePlot by injecting regular Svelte snippets. For instance, the Line mark allows you to provide custom markers by passing a `marker` snippet. So why no use animated line markers, just because we can?

```svelte live
<script lang="ts">
    import { Plot, Line } from '$lib';
    import { fly, fade } from 'svelte/transition';

    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);

    let shown = $state(false);

    $effect(() => {
        const t = setInterval(() => {
            shown = !shown;
        }, 1000);
        return () => clearInterval(t);
    });
</script>

<Plot grid height={300}>
    <Line
        data={aapl.slice(-40)}
        curve="basis"
        x="Date"
        y="Adj Close">
        {#snippet marker(id, color)}
            <marker
                {id}
                fill="none"
                stroke={color}
                markerWidth="6"
                markerHeight="10"
                viewBox="-4 -10 8 10"
                orient="auto">
                {#if shown}
                    <path
                        in:fly={{ duration: 1000, y: -10 }}
                        out:fade
                        d="M0,-10L0,-2m-3,-3 l3,3l3,-3" />
                {/if}
            </marker>
        {/snippet}
    </Line>
</Plot>
```

```svelte
<script>
    // ...
    import { fly, fade } from 'svelte/transition';

    let shown = $state(false);

    $effect(() => {
        const t = setInterval(() => {
            shown = !shown;
        }, 1000);
        return () => clearInterval(t);
    });
</script>

<Plot grid height={300}>
    <Line
        data={aapl.slice(-40)}
        x="Date"
        y="Adj Close"
        curve="basis">
        {#snippet marker(id, color)}
            <marker
                {id}
                fill="none"
                stroke={color}
                markerWidth="6"
                markerHeight="10"
                viewBox="-4 -10 8 10"
                orient="auto">
                {#if shown}
                    <path
                        in:fly={{ duration: 1000, y: -10 }}
                        out:fade
                        d="M0,-10L0,-2m-3,-3 l3,3l3,-3" />
                {/if}
            </marker>
        {/snippet}
    </Line>
</Plot>
```

[fork](https://svelte.dev/playground/45a256864cb14e0ba2d9578a1b21efeb?version=5.28.1)

## Built on top of D3

Like its inspiration Observale Plot, SveltePlot is built on top of D3.
