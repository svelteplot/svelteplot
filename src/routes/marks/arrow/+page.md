---
title: Arrow mark
---

The Arrow mark draws arrows connecting two points in data space. This versatile mark is useful for:

- Showing transitions or changes between two states (like in before/after comparisons)
- Visualizing flows, movements, or progressions
- Creating network/graph visualizations when connecting nodes
- Annotating charts with directional information

If you want to control the arrow length and angle directly rather than using data coordinates, consider using the [vector](/marks/vector) mark instead.

Metro dataset:

```svelte live
<script lang="ts">
    import { css } from '@emotion/css';
    import { Plot, Arrow, Dot, Text } from '$lib/index.js';
    import { page } from '$app/state';
    let { metros } = $derived(page.data.data);

    let hl = $state(false);
</script>

<Plot
    grid
    marginRight={20}
    inset={10}
    height={450}
    x={{ type: 'log', label: 'P..opulation' }}
    y={{ label: 'Inequality' }}
    {css}
    color={{
        label: 'Change in inequality from 1980 to 2015',
        legend: true,
        tickFormat: '+f'
    }}>
    <Arrow
        data={metros}
        x1="POP_1980"
        y1="R90_10_1980"
        x2="POP_2015"
        y2="R90_10_2015"
        bend
        style="transition: opacity 0.2s ease-in"
        opacity={{
            scale: null,
            value: (d) =>
                !hl || hl.Metro === d.Metro ? 1 : 0.1
        }}
        onmouseenter={(evt, d) => (hl = d)}
        onmouseleave={() => (hl = null)}
        stroke={(d) => d.R90_10_2015 - d.R90_10_1980} />
    <Text
        data={metros}
        x="POP_2015"
        y="R90_10_2015"
        filter={(d) =>
            hl ? hl.Metro === d.Metro : d.highlight}
        text="nyt_display"
        fill="currentColor"
        stroke="var(--svelteplot-bg)"
        strokeWidth={4}
        lineAnchor="bottom"
        dy={-6} />
</Plot>
```

```svelte
<Plot
    marginRight={20}
    inset={10}
    height={450}
    x={{ type: 'log', label: 'Population' }}
    y={{ label: 'Inequality', type: 'point' }}
    color={{
        scheme: 'BuRd',
        label: 'Change in inequality from 1980 to 2015',
        legend: true,
        tickFormat: '+f'
    }}>
    <Arrow
        data={metros}
        x1="POP_1980"
        y1="R90_10_1980"
        x2="POP_2015"
        y2="R90_10_2015"
        bend
        style="transition: opacity 0.2s ease-in"
        opacity={{
            scale: null,
            value: (d) =>
                !hl || hl.Metro === d.Metro ? 1 : 0.1
        }}
        onmouseenter={(evt, d) => (hl = d)}
        onmouseleave={() => (hl = null)}
        stroke={(d) => d.R90_10_2015 - d.R90_10_1980} />
    <Text
        data={metros}
        x="POP_2015"
        y="R90_10_2015"
        filter={(d) =>
            hl ? hl.Metro === d.Metro : d.highlight}
        text="nyt_display"
        fill="currentColor"
        stroke="var(--svelteplot-bg)"
        strokeWidth={4}
        lineAnchor="bottom"
        dy={-6} />
</Plot>
```

Works as well with a point scale:

```svelte live
<script lang="ts">
    import {
        Plot,
        Arrow,
        Dot,
        Text,
        AxisY,
        GridY
    } from '$lib/index.js';
    import { page } from '$app/state';
    let { metros } = $derived(page.data.data);
</script>

<Plot
    inset={10}
    x={{ label: 'Population' }}
    y={{ label: '' }}>
    <AxisY tickSize={0} />
    <GridY strokeDasharray="3,3" />
    <Arrow
        data={metros.slice(0, 50)}
        x1="R90_10_1980"
        x2="R90_10_2015"
        y="nyt_display" />
</Plot>
```

```svelte
<Plot
    inset={10}
    x={{ label: 'Population' }}
    y={{ label: '' }}>
    <AxisY tickSize={0} />
    <GridY strokeDasharray="3,3" />
    <Arrow
        data={metros.slice(0, 50)}
        x1="R90_10_1980"
        x2="R90_10_2015"
        y="nyt_display" />
</Plot>
```

Another thing you can use the arrow mark for is drawing network diagrams:

```svelte live
<script lang="ts">
    import {
        Plot,
        Arrow,
        Dot,
        Pointer,
        Text
    } from '$lib/index.js';
    import { json } from 'd3-fetch';
    import {
        forceSimulation,
        forceLink,
        forceManyBody,
        forceCenter
    } from 'd3-force';

    let links = $state([]);
    let nodes = $state([]);

    async function loadNetwork() {
        const graph = await json('/data/miserables.json');
        links = graph.links.map((d) => ({ ...d }));
        nodes = graph.nodes.map((d) => ({ ...d }));
        forceSimulation(nodes)
            .alphaTarget(0.3)
            .force(
                'link',
                forceLink(links).id((d) => d.id)
            )
            .force('charge', forceManyBody())
            .force('center', forceCenter());
    }

    $effect(async () => {
        if (!nodes.length) loadNetwork();
    });
</script>

<Plot
    x={{ axis: false }}
    y={{ axis: false }}
    inset={10}
    color={{ type: 'categorical' }}
    height={550}>
    <Arrow
        data={links}
        x1={(d) => d.source.x}
        y1={(d) => d.source.y}
        x2={(d) => d.target.x}
        y2={(d) => d.target.y}
        bend
        insetStart={(d) => d.source.id.length * 1}
        insetEnd={(d) => d.target.id.length * 1}
        opacity={0.2} />
    <Dot
        data={nodes}
        r={(d) => d.id.length}
        stroke="var(--svelteplot-bg)"
        fill="group"
        x="x"
        y="y" />
    <Pointer data={nodes} x="x" y="y" maxDistance={50}>
        {#snippet children({ data })}
            <Text
                {data}
                text="id"
                fill="currentColor"
                stroke="var(--svelteplot-bg)"
                strokeWidth="3"
                x="x"
                y="y" />
        {/snippet}
    </Pointer>
</Plot>
```

[fork](https://svelte.dev/playground/86683daafa8f46bdb98fce9f43330ad8?version=5.28.2)

## Arrow options

The Arrow mark offers various customization options to control appearance and behavior:

**Core Properties**

- **x1**, **y1** - Coordinates of the arrow's starting point
- **x2**, **y2** - Coordinates of the arrow's ending point
- **data** - Array of data objects containing x1/y1/x2/y2 values (or values that can be accessed via the channel accessors)

**Arrow Style and Shape**

- **bend** - Controls the curvature of the arrow in degrees:

    - Set to a number (e.g., `30`) for a specific bend angle
    - Set to `true` for a default bend of 22.5°
    - Set to `0` or `false` for a straight arrow
    - Positive values curve clockwise, negative values curve counterclockwise

- **sweep** - Controls the direction of the bend:

    - `1` (default) - Standard direction
    - `0` - No bending (straight line regardless of bend angle)
    - `-1` - Reverse direction
    - `'+x'` - Bend follows the x-axis in positive direction
    - `'-x'` - Bend follows the x-axis in negative direction
    - `'+y'` - Bend follows the y-axis in positive direction
    - `'-y'` - Bend follows the y-axis in negative direction

- **headAngle** - The arrowhead angle in degrees (default: 60°)
- **headLength** - Controls the size of the arrowhead (default: 8)

**Spacing and Positioning**

- **insetEnd** - Inset at the end of the arrow; useful when the arrow points to another mark like a dot
- **insetStart** - Inset at the start of the arrow
- **inset** - Shorthand to set both insetStart and insetEnd to the same value

**Visual Styling**

All standard styling properties are also available:

- **stroke** - Arrow color
- **strokeWidth** - Thickness of the arrow
- **opacity** - Transparency of the arrow
- **class** - Custom CSS class for additional styling

**Interactivity**

Event handlers can be attached to arrows for interactive visualizations:

- **onclick**, **onmouseover**, **onmouseenter**, **onmouseleave**, etc.

```svelte live
<script lang="ts">
    import { Plot, Arrow, Dot } from '$lib/index.js';

    import Slider from '$lib/ui/Slider.svelte';
    import Select from '$lib/ui/Select.svelte';

    const data = [
        { x1: 1, y1: 1, x2: 6, y2: 3 },
        { x1: 3, y1: 2, x2: 1, y2: 6 },
        { x2: 3.5, y2: 2.5, x1: 1.5, y1: 6.5 }
    ];

    let bend = $state(22.5);
    let sweep = $state(1);
    let inset = $state(10);
    let headLength = $state(20);
    let headAngle = $state(40);
</script>

<Plot frame grid margin={20} inset={40}>
    {#snippet header()}
        <div style:margin-top="1em">
            <Slider label="inset" bind:value={inset} />
            <Slider
                label="headLength"
                bind:value={headLength} />
            <Slider
                label="headAngle"
                bind:value={headAngle} />
            <Slider
                label="bend"
                max="80"
                bind:value={bend} />
            <Select
                label="sweep: "
                options={[-1, 0, 1, '+x', '-x', '+y', '-y']}
                bind:value={sweep} />
        </div>
    {/snippet}
    <Dot {data} x="x1" y="y1" symbol="plus" opacity="0.4" />
    <Dot
        {data}
        x="x2"
        y="y2"
        symbol="circle"
        opacity="0.4" />
    <Arrow
        {data}
        {bend}
        {sweep}
        x1="x1"
        y1="y1"
        x2="x2"
        y2="y2"
        {inset}
        {headLength}
        {headAngle} />
</Plot>
```
