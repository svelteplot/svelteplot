---
title: Line mark
---

<script>
    import CurveDemo from './CurveDemo.svelte';
    import CO2Decades from './CO2Decades.svelte';

    import { setContext } from 'svelte';
    import { writable } from 'svelte/store';
    const canvas = writable(false);
    setContext('useCanvas', canvas);
</script>

The **line mark** draws two-dimensional lines as in a line chart. Because the line mark interpolates between adjacent data points, typically both the x and y scales are quantitative or temporal. For example, below is a line chart of the closing price of Apple stock.

```svelte live
<script lang="ts">
    import { Plot, Line, RuleY } from 'svelteplot';
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

[fork](https://svelte.dev/playground/316a66aa0af548bdb64a9a472834daee?version=5)

If the **x** and **y** options are not defined, the line mark assumes that the data is an iterable of points \[\[_x₁_, _y₁_\], \[_x₂_, _y₂_\], …\].

```svelte live
<script lang="ts">
    import { Plot, Line, RuleY } from 'svelteplot';
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

[fork](https://svelte.dev/playground/316a66aa0af548bdb64a9a472834daee?version=5)

As with [areas](/marks/area), points in lines are connected in input order: the first point is connected to the second point, the second is connected to the third, and so on. Line data is typically in chronological order. Unsorted data may produce gibberish.

```svelte live
<script lang="ts">
    import { Plot, Line } from 'svelteplot';
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

[fork](https://svelte.dev/playground/e21a4fa678c6427c84221e29cb68bf50?version=5)

If your data isn’t sorted, use the [sort](/transforms/sort) transform.

```svelte live
<script lang="ts">
    import { Plot, Line } from 'svelteplot';
    import { page } from '$app/state';
    import { shuffle } from 'd3-array';
    let { aapl } = $derived(page.data.data);
</script>

<Plot>
    <Line
        data={shuffle(aapl.slice(0))}
        x="Date"
        y="Close"
        sort="Date" />
</Plot>
```

```svelte
<Plot>
    <Line
        data={shuffle(aapl)}
        x="Date"
        y="Close"
        sort="Date" />
</Plot>
```

[fork](https://svelte.dev/playground/0de37ed2d05341f8b7faa85bb7858b41?version=5)

Lines are automatically grouped by `stroke`, `fill`, or the `z` channel. Only points within a group are connected with a line.

```svelte live
<script lang="ts">
    import { Plot, Line } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot color={{ scheme: 'rainbow' }}>
    <Line
        data={aapl}
        x="Date"
        stroke={(d) => d.Date.getFullYear()}
        y="Close" />
</Plot>
```

```svelte
<Plot color={{ scheme: 'rainbow' }}>
    <Line
        data={aapl}
        x="Date"
        y="Close"
        stroke={(d) => d.Date.getFullYear()} />
</Plot>
```

[fork](https://svelte.dev/playground/316a66aa0af548bdb64a9a472834daee?version=5)

While the _x_ scale of a line chart often represents time, this is not required. For example, we can plot the elevation profile of a Tour de France stage.

```svelte live
<script lang="ts">
    import { Plot, Line, RuleY } from 'svelteplot';
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
    <RuleY y={0} />
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
    <RuleY y={0} />
</Plot>
```

[fork](https://svelte.dev/playground/83193494dc8142b69f9ca15988e4a47f?version=5)

There is no requirement that **y** be dependent on **x**; lines can be used in connected scatterplots to show two independent (but often correlated) variables. (See also [phase plots](https://en.wikipedia.org/wiki/Phase_portrait).) The chart below recreates Hannah Fairfield’s [“Driving Shifts Into Reverse”](http://www.nytimes.com/imagepages/2010/05/02/business/02metrics.html) from 2009.

```svelte live
<script>
    import { Plot, Line, Text } from 'svelteplot';

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

BLS Demo:

```svelte live
<script lang="ts">
    import { Plot, Line, RuleY } from 'svelteplot';
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
        canvas={true}
        outlineStroke="var(--svelteplot-bg)"
        sort={(d) => /, MI /.test(d.division)}
        stroke={(d) =>
            /, MI /.test(d.division)
                ? 'red'
                : '#99999956'} />
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

[fork](https://svelte.dev/playground/31a8033153784f33848a7c388a67a82e?version=5)

## Line

The following channels are supported:

- **data** - The data to be visualized (required)
- **x** - Channel accessor for x-axis position (required)
- **y** - Channel accessor for y-axis position (required)
- **z** - Channel accessor for grouping points into separate lines
- **dx** - Horizontal offset for positioning
- **dy** - Vertical offset for positioning

Rendering options:

- **canvas** - Render using Canvas instead of SVG for better performance with large datasets. Note that some features are only supported in SVG rendering (default: false)

Styling:

- **stroke** - Channel accessor for line color, bound to color scale
- **strokeWidth** - Line width in pixels (default: 1.4)
- **strokeOpacity** - Opacity of the line (default: 1)
- **opacity** - Overall opacity of the mark (default: 1)
- **outlineStroke** - Color for adding an outline stroke (casing) behind the line
- **outlineStrokeWidth** - Width of the outline stroke in pixels (default: strokeWidth + 2)
- **outlineStrokeOpacity** - Opacity of the outline stroke (default: 1)
- **lineClass** - CSS class to apply to each line (SVG only)
- **class** - CSS class to apply to the entire lines group (SVG only)

[Interpolation options](#Interpolation):

- **curve** - Line interpolation method (default: "auto")
- **tension** - Tension parameter for curve interpolation (default: 0)
- **sort** - Sort data before drawing (can be a field name or accessor function)

[Marker options](/features/markers) (only SVG rendering):

- **marker** - Symbol to display at points along the line
- **markerStart** - Symbol to display at the start of the line
- **markerMid** - Symbol to display at intermediate points of the line
- **markerEnd** - Symbol to display at the end of the line

[Text along path](#Text-along-path) (only SVG rendering):

- **text** - Text to display along the line path
- **textFill** - Color for the text (default: same as stroke)
- **textStroke** - Outline color for the text
- **textStrokeWidth** - Width of the text outline in pixels (default: 2 if textStroke is set, 0 otherwise)
- **textStartOffset** - Position of text along the path (default: "50%")

## LineY

The [LineY constructor](/marks/line#LineY) provides default channel definitions of **x** = index and **y** = [identity](/features/transforms#identity), letting you pass an array of numbers as data. The [LineX constructor](/marks/line#LineX) similarly provides **x** = identity and **y** = index defaults for lines that go up↑ instead of to the right→. Below, a random walk is made using [d3.cumsum](https://d3js.org/d3-array/summarize#cumsum) and [d3.randomNormal](https://d3js.org/d3-random#randomNormal).

```svelte live
<script lang="ts">
    import { Plot, LineY } from 'svelteplot';
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

[fork](https://svelte.dev/playground/ede4503f8072438e934b7c09b1bea441?version=5)

## LineX

Convenience wrapper for rendering an array of numbers over their indices.

```svelte live
<script lang="ts">
    import { Plot, LineX } from 'svelteplot';
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

## More examples

While uncommon, you can draw a line with ordinal position values. For example below, each line represents a U.S. state; x represents an (ordinal) age group while y represents the proportion of the state’s population in that age group. This chart emphasizes the overall age distribution of the United States, while giving a hint to variation across states.

```svelte live
<script lang="ts">
    import { Plot, Line, RuleY } from 'svelteplot';
    import { page } from '$app/state';
    let { stateage } = $derived(page.data.data);
</script>

<Plot
    grid
    x={{ label: 'Age range (years)' }}
    y={{
        percent: true,

        label: 'Population (%)'
    }}>
    <Line
        data={stateage}
        x="age"
        y="pop_share"
        z="state"
        canvas
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

The following plot demonstrates combining grouping of lines with coloring by value. You can out this [Playground Demo](https://svelte.dev/playground/8adc0301f1b24de6a69a11594ea2bc06?version=5) to see and _edit_ the source code.

<CO2Decades />

With a [spherical projection](/features/projections), line segments become [geodesics](https://en.wikipedia.org/wiki/Great-circle_distance), taking the shortest path between two points on the sphere and wrapping around the antimeridian at 180° longitude. The line below shows Charles Darwin’s voyage on HMS _Beagle_. (Data via [Benjamin Schmidt](https://observablehq.com/@bmschmidt/data-driven-projections-darwins-world).)

```svelte live
<script lang="ts">
    import { Plot, Geo, Dot, Line } from 'svelteplot';
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

[fork](https://svelte.dev/playground/8f433172583d4b7eb4ae1d72572d2e31?version=5)

### Sparklines

```svelte live
<script lang="ts">
    import { Plot, Line, Dot } from 'svelteplot';

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

### Interpolation

You can set the line interpolation using the **interpolation** option.

```svelte live
<script>
    import { Plot, LineY, Dot } from '$lib/index.js';
    import Slider from '$lib/ui/Slider.svelte';
    import Select from '$lib/ui/Select.svelte';

    // curve demo
    const numbers = [
        0.25, 0.09, 0.58, 0.22, 0.38, 0.03, 0.45, 0.12,
        0.87, 0.99, 0.85, 0.5, 0.64, 0.86, 0.6, 0.09, 0.14,
        0.95, 0.92, 0.89
    ];
    let curve = $state('catmull-rom');
    let tension = $state(0.5);
    const CURVES =
        'basis,basis-open,basis-closed,bump-x,bump-y,bundle,cardinal,cardinal-open,cardinal-closed,catmull-rom,catmull-rom-open,catmull-rom-closed,linear,linear-closed,monotone-x,monotone-y,natural,step,step-after,step-before'.split(
            ','
        );
</script>

<Select label="curve" bind:value={curve} options={CURVES} />

{#if curve.includes('bundle') || curve.includes('catmull') || curve.includes('cardinal')}
    <Slider
        label="tension"
        bind:value={tension}
        min={0}
        max={2}
        step={0.1} />
{/if}

<Plot grid testid="curvedemo" height={300}>
    <LineY data={numbers} {curve} {tension} />
    <!-- TODO: use DotY here -->
    <Dot
        data={numbers.map((d, i) => ({
            value: d,
            index: i
        }))}
        symbol="plus"
        y="value"
        x="index" />
</Plot>
```

```svelte
<Plot>
    <LineY
        data={numbers}
        curve="catmul-rom"
        tension={0.3} />
</Plot>
```

As you see in the previous plot, lines can show [markers](/features/markers) by setting the **marker** channel.

### Text along path

Lines can show a text label along the path:

```svelte live
<script lang="ts">
    import { Plot, Line, Dot } from 'svelteplot';
    import { Slider } from '$lib/ui';

    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
    let offset = $state(50);
</script>

<Slider
    bind:value={offset}
    label="textStartOffset"
    min={0}
    max={100} />
<Plot height={200}>
    <Line
        data={aapl.slice(20, 40)}
        x="Date"
        y="Close"
        curve="basis"
        text="AAPL"
        textSize={16}
        textStartOffset="{offset}%" />
</Plot>
```

```svelte
<Plot grid>
    <Line
        data={aapl.slice(20, 40)}
        x="Date"
        y="Close"
        curve="basis"
        text="AAPL" />
</Plot>
```

[fork](https://svelte.dev/playground/6056bec8e77b447684364389b01b16ee?version=5)

### Stacking

Line charts do not support implicit stacking, but you can use the [stack](/transforms/stack) transform explicitly. Here we're adding the baselines and toplines for each area in a stacked area chart:

```svelte live
<script lang="ts">
    import {
        Plot,
        Line,
        AreaY,
        stackY,
        renameChannels
    } from 'svelteplot';
    import { page } from '$app/state';
    const { riaa } = $derived(page.data.data);

    const stacked = $derived(
        stackY(
            {
                data: riaa,
                x: 'year',
                y: 'revenue',
                z: 'format',
                stroke: 'group'
            },
            { offset: 'wiggle' }
        )
    );
</script>

<Plot grid height={250}>
    <AreaY {...stacked} opacity={0.5} fill="group" />
    {#each ['y1', 'y2'] as y}
        <Line {...renameChannels(stacked, { [y]: 'y' })} />
    {/each}
</Plot>
```

```svelte
<Plot grid height={250}>
    <AreaY {...stacked} opacity={0.5} fill="group" />
    {#each ['y1', 'y2'] as y}
        <Line {...renameChannels(stacked, { [y]: 'y' })} />
    {/each}
</Plot>
```

[fork](https://svelte.dev/playground/6c6d74532b8440358735672de5a66768?version=5)

Note that the stackY transform is setting the y1 and y2 channel, but the Line mark expects a y channel. That's why we have to rename the channel using the [renameChannel](/transforms/rename) transform.

### Facetting

Like all marks, Line marks support [faceting](/features/faceting). In this example we show four [normalized](/transform/normalize) animated stock price charts:

```svelte live
<script lang="ts">
    import {
        Plot,
        Line,
        Frame,
        normalizeY
    } from 'svelteplot';
    import { innerWidth } from 'svelte/reactivity/window';
    import { page } from '$app/state';
    import { Checkbox } from '$lib/ui';
    import { writable } from 'svelte/store';

    // Use stocks dataset
    let { stocks } = $derived(page.data.data);

    // Create a store for canvas rendering toggle
    let useCanvas = $state(false);

    let maxDate = $state(new Date('2013-05-13'));

    $effect(() => {
        window.requestAnimationFrame(frame);
    });

    function frame() {
        maxDate = new Date(maxDate.getTime() + 864e5);
        if (maxDate.getFullYear() >= 2018) {
            maxDate = new Date('2013-05-13');
        }
        requestAnimationFrame(frame);
    }

    const normalized = $derived(
        normalizeY(
            {
                data: stocks.filter(
                    (d) =>
                        d.Date <
                            new Date(
                                maxDate.getTime() +
                                    864e5 * 420
                            ) && d.Date > maxDate
                ),
                x: 'Date',
                y: 'Close',
                stroke: 'Symbol'
            },
            'extent'
        )
    );
</script>

<Checkbox label="Canvas rendering" bind:value={useCanvas} />
<Plot
    height={innerWidth.current < 500 ? 400 : 130}
    inset={5}
    x={{
        interval: 'year',
        grid: true,
        tickFormat: (d) => d.getFullYear()
    }}
    y={{ axis: false }}>
    <Frame fill opacity={0.05} />
    <Line
        {...normalized}
        curve="basis"
        strokeWidth={2}
        canvas={useCanvas}
        outlineStroke="var(--svelteplot-bg)"
        {...{
            [innerWidth.current < 500 ? 'fy' : 'fx']:
                'Symbol'
        }} />
    />
</Plot>
```

```svelte
<Line
    {...normalizeY(
        {
            data: stocks,
            x: 'Date',
            y: 'Close',
            stroke: 'Symbol'
        },
        'extent'
    )}
    curve="basis"
    fx="Symbol" />
/>
```

### Gradient lines

You can use the [LinearGradient](/features/gradients) helper components to color lines:

```svelte live
<script lang="ts">
    import {
        Plot,
        Line,
        Frame,
        LinearGradientX,
        LinearGradientY
    } from 'svelteplot';
    import { page } from '$app/state';
    let { sftemp } = $derived(page.data.data);
</script>

<Plot height={250} y={{ grid: true }}>
    <defs>
        <LinearGradientY
            id="gradient-y"
            stops={[
                { y: 70, color: 'var(--svp-red)' },
                { y: 50, color: 'var(--svp-blue)' }
            ]} />
    </defs>
    <Line
        data={sftemp}
        x="date"
        y="high"
        stroke="url(#gradient-y)" />
</Plot>
```

```svelte
<Plot>
    <defs>
        <LinearGradientY
            id="temp-gradient"
            stops={[
                { y: 70, color: 'red' },
                { y: 50, color: 'blue' }
            ]} />
    </defs>
    <Line
        data={sftemp}
        x="date"
        y="high"
        stroke="url(#temp-gradient)" />
</Plot>
```

[fork](https://svelte.dev/playground/20b8564678c842f5bd23133780bc255d?version=5)
