---
title: Text mark
---

Useful for showing text labels. The text mark is using SVG `<text>` elements, so formatting is limited.

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
        strokeWidth={3}
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

```svelte live
<script>
    import { Plot, Dot, Text } from 'svelteplot';

    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot
    grid
    height={500}
    color={{ legend: true }}
    testid="penguins">
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fill="currentColor"
        r={3} />
    <Text
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fill="species"
        stroke="var(--svelteplot-bg)"
        strokeWidth={5}
        strokeOpacity={0.7}
        dx={-3}
        dy={-5}
        textClass={(d) =>
            d.species === 'Chinstrap' ? 'text-italic' : ''}
        textAnchor="start"
        lineAnchor="bottom"
        fontWeight={(d) =>
            d.species === 'Gentoo' ? 'bold' : 'normal'}
        text={(d) => d.island} />
</Plot>

<style>
    :global(.text-italic) {
        font-style: italic;
    }
</style>
```

```svelte
<Plot grid height={500} color={{ legend: true }}>
    <Text
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fill="species"
        text={(d) => d.island.charAt(0)} />
</Plot>
```

## Text options

- **text** - the text contents (a string, possibly with multiple lines)

You can position text either using [frameAnchor](#frame-anchor) or using _x_ and _y_ channels.

- **x** - the horizontal position; bound to the _x_ scale
- **y** - the vertical position; bound to the _y_ scale
- **frameAnchor** - if no x or y is given, the text can be positioned relative to the plot frame - `bottom`, `top`, `left`, `right`, `top-left`, `bottom-left`, `top-right`, `bottom-right`

- **dx** - horizontal offset in px
- **dy** - vertical offset in px
- **textAnchor** - `start`, `end`, or `middle`
- **lineAnchor** - `top`, `bottom` or `middle`
- **lineHeight** - expressed as factor of font size, default 1.1
- **class** - CSS class name to applied to the `<g>` around all texts
- **textClass** - CSS class to be applied to each `<text>` element, can be a function of data
- **rotate** - rotation angle in degrees _added in 0.4.0_

### Frame anchor

You can align text relative to the plot frame. This is useful for captions or annotation labels:

```svelte live
<script>
    import { Plot, Dot, Text } from 'svelteplot';

    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot
    grid
    height={200}
    axes={false}
    x={{ domain: [0, 10] }}
    y={{ domain: [0, 10] }}>
    {#each ['top', 'bottom', 'center', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'] as frameAnchor}
        <Text
            {frameAnchor}
            fontSize={15}
            text={frameAnchor} />
    {/each}
</Plot>
```

```svelte
<Plot
    frame
    grid
    axes={false}
    x={{ domain: [0, 10] }}
    y={{ domain: [0, 10] }}>
    {#each ['top', 'bottom', 'center', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'] as frameAnchor}
        <Text
            {frameAnchor}
            text={frameAnchor}
            fontSize={15} />
    {/each}
</Plot>
```

## Styling options

- **fontSize** - the font size in pixels
- **fontWeight** - the font size in pixels

TODO: add example for multiline text
