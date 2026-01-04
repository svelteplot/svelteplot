---
title: Custom marks
---

You can use the custom mark to render your own marks. You can pass data to the custom mark and use the plot scales. Let's say we want to render our own symbols instead of using the [dot mark](/marks/dot):

```svelte live
<script>
    import { Plot, Dot, CustomMark } from 'svelteplot';
    import Spiral from '$lib/ui/Spiral.svelte';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot grid inset={10}>
    <CustomMark
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="species">
        {#snippet mark({ record })}
            <g
                transform="translate({[
                    record.x,
                    record.y
                ]})">
                <path
                    d="M-3,-3L3,3 M3,-3L-3,3 M-4,0H4 M0,-4V4"
                    stroke={record.stroke} />
            </g>
        {/snippet}
    </CustomMark>
</Plot>
```

```svelte
<CustomMark
    data={penguins}
    x="culmen_length_mm"
    y="culmen_depth_mm"
    stroke="species">
    {#snippet mark({ record })}
        <g transform="translate({[record.x, record.y]})">
            <path
                d="M-3,-3L3,3 M3,-3L-3,3 M-4,0H4 M0,-4V4"
                stroke={record.stroke} />
        </g>
    {/snippet}
</CustomMark>
```

We can also pass the `marks` (plural) snippet to draw all symbols at once:

```svelte
<CustomMark
    data={penguins}
    x="culmen_length_mm"
    y="culmen_depth_mm">
    {#snippet marks({ records })}
        <polyline
            points={records
                .map((r) => [r.x, r.y])
                .join(' ')} />
    {/snippet}
</CustomMark>
```

```svelte live
<script>
    import { Plot, Dot, CustomMark } from 'svelteplot';
    import Spiral from '$lib/ui/Spiral.svelte';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot grid inset={10}>
    <CustomMark
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm">
        {#snippet marks({ records })}
            <polyline
                stroke="currentColor"
                fill="none"
                points={records
                    .map((r) => [r.x, r.y])
                    .join(' ')} />
        {/snippet}
    </CustomMark>
</Plot>
```

see [example](/examples/custom/multiple)

Or we can use a custom mark to draw the topline of a histogram:

```svelte live
<script>
    import { range } from 'd3-array';
    import { randomNormal } from 'd3-random';
    import { page } from '$app/state';
    let { olympians } = $derived(page.data.data);
    import {
        Plot,
        RectY,
        binX,
        CustomMark,
        stackY
    } from 'svelteplot';
</script>

<Plot height={300} y={{ zero: true }}>
    {@const binned = binX(
        { data: olympians, x: 'weight' },
        { y: 'count', interval: 3 }
    )}
    <RectY {...binned} opacity={0.2} />
    <CustomMark {...stackY(binned)}>
        {#snippet marks({ records })}
            <path
                d="M{records[0].x1},{records[0].y1} {records
                    .map((r) => `V${r.y2}H${r.x2}`)
                    .join(' ')}"
                stroke="currentColor"
                fill="none" />
        {/snippet}
    </CustomMark>
</Plot>
```

```svelte
<Plot height={300} y={{ zero: true }}>
    {@const binned = binX(
        { data: olympians, x: 'weight' },
        { y: 'count', interval: 3 }
    )}
    <RectY {...binned} opacity={0.2} />
    <CustomMark {...stackY(binned)}>
        {#snippet marks({ records })}
            <path
                d="M{records[0].x1},{records[0].y1} {records
                    .map((r) => `V${r.y2}H${r.x2}`)
                    .join(' ')}"
                stroke="currentColor"
                fill="none" />
        {/snippet}
    </CustomMark>
</Plot>
```

## CustomMark

[API Reference](/api/marks#CustomMark)

```svelte
<CustomMark {data} {...channels}>
    {#snippet mark({ record })}
        <!-- custom svg markup here -->
    {/snippet}
</CustomMark>
```

## CustomMarkHTML

[API Reference](/api/marks#CustomMarkHTML)

You can arrange custom HTML elements in the plot using the `CustomMarkHTML` mark (name subject to change)

```svelte live
<script>
    import { Plot, Dot, CustomMarkHTML } from 'svelteplot';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot grid>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="species"
        symbol="species" />
    {#snippet overlay()}
        <CustomMarkHTML
            data={penguins}
            x="culmen_length_mm"
            y="culmen_depth_mm">
            {#snippet children({ datum })}
                <div
                    style="width:80px;height: 2em;position:absolute;top:-1em;left:-40px; text-align:center">
                    {datum.species}
                </div>
            {/snippet}
        </CustomMarkHTML>
    {/snippet}
</Plot>
```

```svelte
<Plot grid>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="species"
        symbol="species" />
    {#snippet overlay()}
        <CustomMarkHTML
            data={penguins}
            x="culmen_length_mm"
            y="culmen_depth_mm">
            {#snippet children({ datum })}
                <div
                    style="width:80px;height: 2em;position:absolute;top:-1em;left:-40px; text-align:center">
                    {datum.species}
                </div>
            {/snippet}
        </CustomMarkHTML>
    {/snippet}
</Plot>
```

```svelte live
<script>
    import { Plot, Dot, CustomMarkHTML } from 'svelteplot';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
    import { sampleSize } from 'es-toolkit';

    let data = $derived(
        sampleSize(penguins, 5).map((d, i) => ({
            ...d,
            i: i,
            dx: [50, -30, 60, 20, 0][i],
            dy: [-40, 30, 20, 0, 40][i],
            width: 100,
            height: 50,
            anchor: 'tl'
        }))
    );
</script>

<Plot grid inset={40}>
    <Dot
        {data}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="species"
        symbol="species" />
    {#snippet overlay()}
        <CustomMarkHTML
            {data}
            x="culmen_length_mm"
            y="culmen_depth_mm">
            {#snippet children({ datum })}
                <div
                    style:width="{datum.width}px"
                    style:height="{datum.height}px"
                    style:background="#ffffff99"
                    style:border="1px solid #ccc"
                    style="position:absolute"
                    style:top="{datum.dy < 0
                        ? -datum.heigh + datum.dy
                        : datum.dy > 0
                          ? datum.dy
                          : -datum.height * 0.5}px"
                    style:left="-40px">
                    {datum.i}: {datum.species}
                    {datum.dy}
                </div>
            {/snippet}
        </CustomMarkHTML>
    {/snippet}
</Plot>
```

### Options

- data
- x
- y
- frameAnchor (see [Text](/marks/text) mark)
