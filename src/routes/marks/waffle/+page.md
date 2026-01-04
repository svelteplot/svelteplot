---
title: Waffle mark
---

:::info
added in 0.7.0
:::

The Waffle mark renders pictograms or waffle charts, which are grids of squares used to visualize proportions over a band scale. They can be used like Bar marks. Waffles are useful for reading exact quantities. How quickly can you compare counts of the fruits below?

```svelte live
<script>
    import { Plot, WaffleY, RuleY } from 'svelteplot';
</script>

<Plot x={{ domain: ['Apple', 'Banana', 'Cherry', 'Date'] }}>
    <WaffleY data={[212, 207, 315, 11]} />
</Plot>
```

```svelte
<Plot x={{ domain: ['Apple', 'Banana', 'Cherry', 'Date'] }}>
    <WaffleY data={[212, 207, 315, 11]} />
</Plot>
```

[fork](https://svelte.dev/playground/7312ce68199747b8b49814bb4adcefee?version=5)

The waffle mark is often used with the group transform to compute counts. The chart below compares the number of female and male athletes in the 2012 Olympics.

```svelte live
<script>
    import { Plot, WaffleY, groupX } from 'svelteplot';
    import { page } from '$app/state';
    let { olympians } = $derived(page.data.data);
</script>

<Plot>
    <WaffleY
        unit={10}
        {...groupX(
            { data: olympians, x: 'sex' },
            { y: 'count' }
        )} />
</Plot>
```

```svelte
<Plot>
    <WaffleY
        unit={10}
        {...groupX(
            { data: olympians, x: 'sex' },
            { y: 'count' }
        )} />
</Plot>
```

The **unit** option determines the quantity each waffle cell represents; it defaults to one. The unit may be set to a value greater than one for large quantities, or less than one (but greater than zero) for small fractional quantities. Try changing the unit below to see its effect.

```svelte live
<script>
    import { Plot, WaffleY, groupX } from 'svelteplot';
    import { RadioInput } from '$lib/ui';
    import { page } from '$app/state';
    let { olympians } = $derived(page.data.data);
    let unit = $state(10);
</script>

<RadioInput
    bind:value={unit}
    label="Unit"
    options={[1, 2, 5, 10, 25, 50, 100]} />

<Plot
    x={{
        type: 'band',
        tickFormat: (d) => d.getFullYear()
    }}>
    <WaffleY
        {unit}
        {...groupX(
            {
                data: olympians,
                x: 'date_of_birth'
            },
            { y: 'count', interval: '5 years' }
        )} />
</Plot>
```

```svelte
<Plot
    x={{
        type: 'band',
        tickFormat: (d) => d.getFullYear()
    }}>
    <WaffleY
        unit={10}
        {...groupX(
            {
                data: olympians,
                x: 'date_of_birth'
            },
            { y: 'count', interval: '5 years' }
        )} />
</Plot>
```

Like bars, waffles can be stacked, and implicitly apply the stack transform when only a single quantitative channel is supplied.

```svelte live
<script>
    import { Plot, WaffleY, groupX } from 'svelteplot';
    import { RadioInput } from '$lib/ui';
    import { page } from '$app/state';
    let { olympians } = $derived(page.data.data);
</script>

<Plot
    color={{ legend: true }}
    x={{
        type: 'band',
        sort: true
    }}>
    <WaffleY
        unit={10}
        sort="sex"
        {...groupX(
            {
                data: olympians,
                x: 'weight',
                fill: 'sex'
            },
            { y: 'count', interval: 10 }
        )} />
</Plot>
```

Waffles can also be used to highlight a proportion of the whole. The chart below recreates a graphic of survey responses from [“Teens in Syria”](https://www.economist.com/graphic-detail/2015/08/19/teens-in-syria) by _The Economist_ (August 19, 2015); positive responses are in orange, while negative responses are in gray. The `borderRadius` option is used to produce circles instead of squares.

```svelte live
<script>
    import { Plot, WaffleY, Text } from 'svelteplot';
    import { Slider } from '$lib/ui';
    import { autoType, csvParse } from 'd3-dsv';
    const survey = csvParse(
        `response,count\ndo no activities other than school,89\ndon’t go out afterdark,96\n"engage in political discussion and social movements, including online",10\nwould like to doactivities but areprevented by safetyconcerns,73`,
        autoType
    );
</script>

<Plot
    axes={false}
    height={230}
    title="Subdued"
    subtitle="Of 120 surveyed Syrian teenagers:"
    y={{ insetTop: 5, insetBottom: 30 }}
    fx={{ axis: 'bottom' }}
    marginBottom={60}>
    <WaffleY
        borderRadius={20}
        opacity={0.3}
        unit={1}
        data={[120]} />

    <WaffleY
        borderRadius={20}
        unit={1}
        data={survey}
        fx="response"
        x={0}
        fill="orange"
        y="count" />

    <Text
        data={survey}
        fx="response"
        frameAnchor="bottom"
        lineAnchor="bottom"
        dy={-5}
        fontWeight="bold"
        fill="orange"
        fontSize={18}
        text={(d) =>
            Intl.NumberFormat('en-US', {
                style: 'percent'
            }).format(d.count / 120)} />
</Plot>
```

The waffle mark comes in two orientations: waffleY extends vertically↑, while waffleX extends horizontally→. The waffle mark automatically determines the appropriate number of cells per row or per column (depending on orientation) such that the cells are square, don’t overlap, and are consistent with position scales.

```svelte live
<script>
    import { Plot, WaffleX } from 'svelteplot';
    import { Slider } from '$lib/ui';
    let apples = $state(435);
</script>

<Slider
    label="Apples"
    bind:value={apples}
    min={10}
    max={1000}
    step={1} />

<Plot
    height={200}
    marginRight={15}
    y={{ domain: ['Apples'] }}>
    <WaffleX data={[apples]} />
</Plot>
```

You can pass the **symbol** snippet to customize the shape of the waffle cells (but remember to [choose your icon wisely](https://www.vis4.net/blog/choose-your-icons-wisely/)).

```svelte live
<script>
    import {
        Plot,
        WaffleY,
        RuleY,
        groupX
    } from 'svelteplot';

    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);

    let frame = $state(0);
    $effect(() => {
        const i = setInterval(
            () => (frame = frame ? 0 : 1),
            240
        );
        return () => clearInterval(i);
    });
</script>

<Plot color={{ legend: true }}>
    <RuleY data={[0]} />
    <WaffleY
        dy={-1}
        round
        unit={1}
        {...groupX(
            {
                data: penguins,
                x: 'island',
                fill: 'species'
            },
            { y: 'count' }
        )}>
        {#snippet symbol({
            x,
            y,
            height,
            width,
            style,
            styleClass
        })}
            <g
                {style}
                class={styleClass}
                transform={`translate(${x}, ${y}) scale(${width / 800}, ${height / 800})`}>
                <!-- icon is 800*800px so we need to scale it down -^ -->
                {#if frame === 0}
                    <path
                        d="M687.95 333.35c-27.95-17.21-50.35-28.36-67.47-34.32-4.35-26.59-7.18-56.73-7.18-92.32C613.29 92.06 517.31.08 400 .08S186.71 92.06 186.71 206.71c0 35.59-2.83 65.73-7.18 92.32-17.13 5.97-39.53 17.11-67.47 34.32C-31.92 422.66-3.92 546.64 17.41 531.98c53.75-39.26 97.78-77.75 131.07-111.95-8.52 30.16-15.09 59.94-15.09 95.95 0 88.86 45.45 167.69 117.13 213.98 2.49 15.33 5.84 32.64-1.82 40.31-8 6.67-29.99-1.33-40.66-1.33-26.66 0-49.32 31-49.32 31h213.29c1.33 0-20-31-47.99-31-10.66 0-32.66 9.33-40.66 1.33-5.63-5.63-5.32-11.38-3.77-25.96 36.71 18.48 76.35 28.96 120.41 28.96s82.74-10.23 119.15-28.31c1.49 14.42 1.71 19.77-3.83 25.31-8 6.67-29.99-1.33-40.66-1.33-26.66 0-49.32 31-49.32 31h213.29c1.33 0-20-31-47.99-31-10.66 0-32.66 9.33-40.66 1.33-7.51-7.51-4.44-23.84-1.97-39.36 72.51-46.15 118.62-125.45 118.62-214.92 0-36.01-6.57-65.79-15.09-95.95 33.29 34.2 77.32 72.69 131.07 111.95 21.33 14.66 49.32-109.31-94.65-198.63Zm-213.86-173.3c25.24 0 45.89 20.43 45.89 47.14s-20.65 47.14-45.89 47.14-45.89-20.43-45.89-47.14 20.65-47.14 45.89-47.14Zm-147.31 0c25.72 0 46.75 20.43 46.75 47.14s-21.04 47.14-46.75 47.14-46.75-20.43-46.75-47.14 21.04-47.14 46.75-47.14Z" />
                {:else}
                    <path
                        d="M651.04 291s-13.94 13.91-31.06 7.95c-4.35-26.59-7.18-56.73-7.18-92.32C612.79 91.98 516.81 0 399.5 0 282.19 0 186.21 91.98 186.21 206.63c0 35.59-2.83 65.73-7.18 92.32-17.13 5.97-26.458-23.727-72.03-32.53-63-12.17-98 32.53-98 66.85 84.5.01 59.5 57.65 138.98 86.68-8.52 30.16-15.09 59.94-15.09 95.95 0 88.86 45.45 167.69 117.13 213.98 2.49 15.33 5.84 32.64-1.82 40.31-8 6.67-29.99-1.33-40.66-1.33-26.66 0-49.32 31-49.32 31h213.29c1.33 0-20-31-47.99-31-10.66 0-32.66 9.33-40.66 1.33-5.63-5.63-5.32-11.38-3.77-25.96 36.71 18.48 76.35 28.96 120.41 28.96s82.74-10.23 119.15-28.31c1.49 14.42 1.71 19.77-3.83 25.31-8 6.67-29.99-1.33-40.66-1.33-26.66 0-49.32 31-49.32 31h213.29c1.33 0-20-31-47.99-31-10.66 0-32.66 9.33-40.66 1.33-7.51-7.51-4.44-23.84-1.97-39.36 72.51-46.15 118.62-125.45 118.62-214.92 0-36.01-6.57-65.79-15.09-95.95C718.5 395.86 727 339.5 791 333.27c0-54.91-29.5-66.85-84.5-66.85-30.5 0-55.46 24.58-55.46 24.58ZM473.59 159.97c25.24 0 45.89 20.43 45.89 47.14s-20.65 47.14-45.89 47.14c-25.24 0-45.89-20.43-45.89-47.14s20.65-47.14 45.89-47.14Zm-147.31 0c25.72 0 46.75 20.43 46.75 47.14s-21.04 47.14-46.75 47.14-46.75-20.43-46.75-47.14 21.04-47.14 46.75-47.14Z" />
                {/if}
            </g>
        {/snippet}
    </WaffleY>
</Plot>
```

[fork](https://svelte.dev/playground/be263ac346794e71a80e6ce86b592eef?version=5)

## Waffle options

The waffle mark accepts the following options in addition to the standard mark options:

- **unit** - The quantity each waffle cell represents, defaults to 1.
- **gap** - The gap (in pixels) between waffle cells, defaults to 1.
- **multiple** - Specifies how many cells should be shown per row (in WaffleY) or per column (in WaffleX). By default, the mark automatically determines this value to ensure square cells. Note that setting this option may result in non-square cells.
- **borderRadius** - Either a number or an object with individual corner radii `{ topLeft, topRight, bottomLeft, bottomRight }`.
- **symbol** - A snippet you can use to customize the shape of each waffle cell. The symbol snippet is provided with the following variables `{ x, y, width, height, datum }` and you need to make sure your symbol fits within the specified width and height.

## WaffleX

[API Reference](/api/marks#WaffleX)

Renders a horizontal waffle chart → that shows quantities along the x axis over categorical values on a band scale along the x axis, similar to [BarX](/marks/bar/#BarX).

Channels:

- **x1** - The quantitative x position.
- **x2** - The quantitative x position.
- **x** - If you provide only this channel, the waffle mark use the implicit stack transform to compute `x1` and `x2`.
- **y** - The categorical y position (required).

```svelte live
<script>
    import { Plot, WaffleX } from 'svelteplot';
</script>

<Plot
    height={150}
    color={{ scheme: 'paired' }}
    marginLeft={4}
    x={{ insetRight: 6 }}
    y={{ axis: false, type: 'band', domain: [0] }}>
    <WaffleX
        data={[
            { month: 'Jan', days: 31 },
            { month: 'Feb', days: 28 },
            { month: 'Mar', days: 31 },
            { month: 'Apr', days: 30 },
            { month: 'May', days: 31 },
            { month: 'Jun', days: 30 },
            { month: 'Jul', days: 31 },
            { month: 'Aug', days: 31 },
            { month: 'Sep', days: 30 },
            { month: 'Oct', days: 31 },
            { month: 'Nov', days: 30 },
            { month: 'Dec', days: 31 }
        ]}
        fill="month"
        x="days" />
</Plot>
```

```svelte
<WaffleX
    data={[
        { month: 'Jan', days: 31 },
        // ... other months ...
        { month: 'Dec', days: 31 }
    ]}
    fill="month"
    x="days" />
```

## WaffleY

[API Reference](/api/marks#WaffleY)

Renders a vertical waffle chart ↑ that shows quantities along the y axis over categorical values on a band scale along the x axis, similar to [BarY](/marks/bar/#BarY).

Channels:

- **y1** - The quantitative y position for the start of each waffle.
- **y2** - The quantitative y position for the end of each waffle.
- **y** - If you provide only this channel, the waffle mark use the implicit stack transform to compute `y1` and `y2`.
- **x** - The categorical x position (required).
