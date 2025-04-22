---
title: Line mark
---

<script>
    import CurveDemo from './CurveDemo.svelte';
    import CO2Decades from './CO2Decades.svelte';
</script>

The **line mark** draws two-dimensional lines as in a line chart. Because the line mark interpolates between adjacent data points, typically both the x and y scales are quantitative or temporal. For example, below is a line chart of the closing price of Apple stock.

```svelte live
<script lang="ts">
    import { Plot, Line, RuleY } from '$lib';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot y={{ grid: true }}>
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

```svelte
<Plot y={{ grid: true }}>
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

[Fork](https://svelte.dev/playground/316a66aa0af548bdb64a9a472834daee?version=5.28.1)

If the **x** and **y** options are not defined, the line mark assumes that the data is an iterable of points \[\[_x₁_, _y₁_\], \[_x₂_, _y₂_\], …\].

```svelte live
<script lang="ts">
    import { Plot, Line, RuleY } from '$lib';
    import type { Datasets } from '$lib/types.js';

    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot>
    <Line data={aapl.map((d) => [d.Date, d.Close])} />
</Plot>
```

```svelte
<Plot>
    <Line data={aapl.map((d) => [d.Date, d.Close])} />
</Plot>
```

The [LineY constructor](/marks/line#LineY) provides default channel definitions of **x** = index and **y** = [identity](/features/transforms#identity), letting you pass an array of numbers as data. The [LineX constructor](/marks/line#LineX) similarly provides **x** = identity and **y** = index defaults for lines that go up↑ instead of to the right→. Below, a random walk is made using [d3.cumsum](https://d3js.org/d3-array/summarize#cumsum) and [d3.randomNormal](https://d3js.org/d3-random#randomNormal).

```svelte live
<script lang="ts">
    import { Plot, LineY } from '$lib';
    import type { Datasets } from '$lib/types.js';
    import { randomNormal } from 'd3-random';
    import { range, cumsum } from 'd3-array';
</script>

<Plot grid height={250}>
    <LineY data={cumsum(range(600).map(randomNormal()))} />
</Plot>
```

```svelte
<Plot grid>
    <LineY data={cumsum(range(600).map(randomNormal()))} />
</Plot>
```

As with [areas](/marks/area), points in lines are connected in input order: the first point is connected to the second point, the second is connected to the third, and so on. Line data is typically in chronological order. Unsorted data may produce gibberish.

```svelte live
<script lang="ts">
    import { Plot, Line } from '$lib';
    import { page } from '$app/state';
    import { shuffle } from 'd3-array';
    let { aapl } = $derived(page.data.data);
</script>

<Plot y={{ grid: true }}>
    <Line
        data={shuffle(aapl.slice(0))}
        x="Date"
        y="Close" />
</Plot>
```

```svelte
<Plot y={{ grid: true }}>
    <Line data={shuffle(aapl)} x="Date" y="Close" />
</Plot>
```

If your data isn’t sorted, use the [sort](/transforms/sort) transform.

```svelte live
<script lang="ts">
    import { Plot, Line } from '$lib';
    import { page } from '$app/state';
    import { shuffle } from 'd3-array';
    let { aapl } = $derived(page.data.data);
</script>

<Plot y={{ grid: true }}>
    <Line
        data={shuffle(aapl.slice(0))}
        x="Date"
        y="Close"
        sort="Date" />
</Plot>
```

```svelte
<Plot y={{ grid: true }}>
    <Line
        data={shuffle(aapl)}
        x="Date"
        y="Close"
        sort="Date" />
</Plot>
```

Grouping

```svelte live
<script lang="ts">
    import { Plot, Line } from '$lib';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot>
    <Line
        data={aapl}
        x="Date"
        stroke={(d) => d.Date.getFullYear()}
        y="Close" />
</Plot>
```

```svelte
<Plot>
    <Line
        data={aapl}
        x="Date"
        y="Close"
        stroke={(d) => d.Date.getFullYear()} />
</Plot>
```

While the _x_ scale of a line chart often represents time, this is not required. For example, we can plot the elevation profile of a Tour de France stage.

```svelte live
<script lang="ts">
    import { Plot, Line, RuleY } from '$lib';
    import { page } from '$app/state';
    let { tdf } = $derived(page.data.data);
</script>

<Plot
    x={{ label: 'Distance from stage start (km)' }}
    y={{
        grid: true,
        interval: 100,
        label: 'Elevation (m)'
    }}>
    <Line data={tdf} x="distance" y="elevation" />
    <RuleY data={[0]} />
</Plot>
```

```svelte
<Plot
    x={{ label: 'Distance from stage start (km)' }}
    y={{
        grid: true,
        interval: 100,
        label: 'Elevation (m)'
    }}>
    <Line data={tdf} x="distance" y="elevation" />
    <RuleY data={[0]} />
</Plot>
```

There is no requirement that **y** be dependent on **x**; lines can be used in connected scatterplots to show two independent (but often correlated) variables. (See also [phase plots](https://en.wikipedia.org/wiki/Phase_portrait).) The chart below recreates Hannah Fairfield’s [“Driving Shifts Into Reverse”](http://www.nytimes.com/imagepages/2010/05/02/business/02metrics.html) from 2009.

```svelte live
<script>
    import { Plot, Line, Text } from '$lib';

    import { page } from '$app/state';
    let { driving } = $derived(page.data.data);
</script>

<Plot
    inset={10}
    grid
    height={500}
    x={{ label: 'Miles driven (per person-year) →' }}
    y={{ label: '↑ Cost of gasoline ($ per gallon)' }}>
    <Line
        data={driving}
        x="miles"
        y="gas"
        curve="catmull-rom"
        marker="arrow" />
    <Text
        data={driving}
        x="miles"
        y="gas"
        text="year"
        fill="currentColor"
        stroke="var(--svelteplot-bg)"
        filter={(d) => d.year % 5 === 0}
        dx={(d) =>
            d.side === 'left'
                ? -5
                : d.side === 'right'
                  ? 5
                  : 0}
        dy={(d) =>
            d.side === 'top'
                ? 5
                : d.side === 'bottom'
                  ? -5
                  : 0}
        textAnchor={(d) =>
            d.side === 'left'
                ? 'end'
                : d.side === 'right'
                  ? 'start'
                  : 'center'}
        lineAnchor={(d) =>
            d.side === 'top'
                ? 'top'
                : d.side === 'bottom'
                  ? 'bottom'
                  : 'middle'} />
</Plot>
```

The following channels are supported:

- **x** - bound to x scale
- **y** - bound to y scale
- **z**
- **stroke** - bound to color scale
- **sort**
- **outlineStroke** - for adding an outline stroke aka casing behind the line
- **outlineStrokeWidth** -

BLS Demo:

```svelte live
<script lang="ts">
    import { Plot, Line, RuleY } from '$lib';
    import type { Datasets } from '$lib/types.js';

    import { page } from '$app/state';
    let { bls } = $derived(page.data.data);
</script>

<Plot grid>
    <Line
        data={bls}
        x="date"
        y="unemployment"
        z="division"
        outlineStroke="var(--svelteplot-bg)"
        sort={(d) => /, MI /.test(d.division)}
        stroke={(d) =>
            /, MI /.test(d.division)
                ? 'red'
                : '#99999955'} />
</Plot>
```

```svelte
<Plot grid>
    <Line
        data={bls}
        x="date"
        y="unemployment"
        z="division"
        sort={(d) => /, MI /.test(d.division)}
        stroke={(d) =>
            /, MI /.test(d.division) ? 'red' : '#ccc'} />
</Plot>
```

## Line

Channels:

## LineX

Convenience wrapper

```svelte live
<script lang="ts">
    import { Plot, LineX } from '$lib';
    import { range } from 'd3-array';
</script>

<Plot grid x={{ nice: true }} maxWidth="180px">
    <LineX
        data={range(Math.PI * 100).map((i) =>
            Math.sin(i / 20)
        )} />
</Plot>
```

```svelte
<Plot grid x={{ nice: true }}>
    <LineX
        data={range(Math.PI * 100).map((i) =>
            Math.sin(i / 20)
        )} />
</Plot>
```

## LineY

Convenience wrapper for wrapping a list of numbers over their indices

```svelte live
<script lang="ts">
    import { Plot, LineY, AreaY } from '$lib';
    import { range } from 'd3-array';
</script>

<Plot grid y={{ nice: true }} height={150}>
    <LineY
        data={range(Math.PI * 100).map((i) =>
            Math.sin(i / 10)
        )} />
</Plot>
```

```svelte
<Plot grid y={{ nice: true }}>
    <LineY
        data={range(Math.PI * 100).map((i) =>
            Math.sin(i / 50)
        )} />
</Plot>
```

LineY can automatically group?

```svelte live
<script lang="ts">
    import { Plot, LineY } from '$lib';
    import { page } from '$app/state';
    let { riaa } = $derived(page.data.data);
</script>

<Plot grid y={{ nice: true }} height={350}>
    <LineY
        data={riaa}
        x="year"
        y="revenue"
        z="format"
        stroke="group" />
</Plot>
```

## Interpolation

You can set the line interpolation using the **interpolation** option.

<CurveDemo />

As you see in the previous plot, lines can show [markers](/features/markers) by setting the **marker** channel.

## More examples

While uncommon, you can draw a line with ordinal position values. For example below, each line represents a U.S. state; x represents an (ordinal) age group while y represents the proportion of the state’s population in that age group. This chart emphasizes the overall age distribution of the United States, while giving a hint to variation across states.

```svelte live
<script lang="ts">
    import { Plot, Line, RuleY } from '$lib';
    import { page } from '$app/state';
    let { stateage } = $derived(page.data.data);
</script>

<Plot
    x={{ label: 'Age range (years)' }}
    y={{
        percent: true,
        grid: true,
        label: 'Population (%)'
    }}>
    <Line
        data={stateage}
        x="age"
        y="pop_share"
        z="state"
        strokeOpacity={0.5} />
    <RuleY data={[0]} />
</Plot>
```

```svelte
<Plot
    x={{ label: 'Age range (years)' }}
    y={{
        percent: true,
        grid: true,
        label: 'Population (%)'
    }}>
    <Line data={stateage} x="age" y="pop_share" z="state" />
    <RuleY data={[0]} />
</Plot>
```

The following plot demonstrates combining grouping of lines with coloring by value. You can out this [Playground Demo](https://svelte.dev/playground/8adc0301f1b24de6a69a11594ea2bc06?version=5.28.1) to see and _edit_ the source code.

<CO2Decades />

With a [spherical projection](/features/projections), line segments become [geodesics](https://en.wikipedia.org/wiki/Great-circle_distance), taking the shortest path between two points on the sphere and wrapping around the antimeridian at 180° longitude. The line below shows Charles Darwin’s voyage on HMS _Beagle_. (Data via [Benjamin Schmidt](https://observablehq.com/@bmschmidt/data-driven-projections-darwins-world).)

```svelte live
<script lang="ts">
    import { Plot, Geo, Dot, Line } from '$lib';
    import { page } from '$app/state';
    import * as topojson from 'topojson-client';
    const { world, beagle } = $derived(page.data.data);
    const land = $derived(
        topojson.feature(world, world.objects.land)
    );
</script>

<Plot projection="equirectangular">
    <Geo data={[land]} stroke="currentColor" />
    <Line
        data={beagle}
        x="lon"
        y="lat"
        stroke="var(--svp-red)" />
    <Geo
        data={[
            { type: 'Point', coordinates: [-0.13, 51.5] }
        ]}
        fill="var(--svp-red)" />
</Plot>
```

```svelte
<Plot projection="equirectangular">
    <Geo data={[land]} stroke="currentColor" />
    <Line
        data={beagle}
        x="lon"
        y="lat"
        stroke="var(--svp-red)" />
    <Geo
        data={[
            { type: 'Point', coordinates: [-0.13, 51.5] }
        ]}
        fill="var(--svp-red)" />
</Plot>
```

[fork](https://svelte.dev/playground/8f433172583d4b7eb4ae1d72572d2e31?version=5.28.1)

Lines can show a text label along the path:

```svelte live
<script lang="ts">
    import { Plot, Line, Dot } from '$lib';

    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot grid>
    <Line
        data={aapl.slice(20, 40)}
        x="Date"
        y="Close"
        curve="basis"
        text="AAPL" />
</Plot>
```

```svelte live
<script lang="ts">
    import { Plot, Line, Dot } from '$lib';

    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<p>
    By disabling the plot axes and reducing the margins and
    inset you can place tiny line charts
    <Plot
        axes={false}
        inset={3}
        width={40}
        height={25}
        margins={0}
        testid="axis-off">
        <Line data={aapl.slice(-60)} x="Date" y="Close" />
    </Plot> inside a text paragraph or table -- often referred
    to as sparklines.
</p>

<style>
    p :global(figure.svelteplot) {
        display: inline-block;
        vertical-align: baseline;
    }
</style>
```

Doo

```svelte
<p>
    By disabling the plot axes and reducing the margins and
    inset you can place tiny line charts
    <Plot
        axes={false}
        inset={3}
        width={40}
        height={25}
        margins={0}>
        <Line data={aapl.slice(-60)} x="Date" y="Close" />
    </Plot> inside a text paragraph or table -- often referred
    to as sparklines.
</p>
```
