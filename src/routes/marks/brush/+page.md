---
title: Brush mark
---

The **Brush** mark is useful for interactively selecting data. In contrast to the [Pointer](/marks/pointer) mark, the Brush mark is not bound to data; it will simply let you drag a rectangular selection and bind to the `brush` property or listen to brush events.

```svelte live
<script>
    import { Plot, Dot, Rect, Brush } from 'svelteplot';
    import { page } from '$app/state';

    const { penguins } = $derived(page.data.data);

    let brush = $state({ enabled: false });
    function fmt(o) {
        return JSON.stringify(
            Object.fromEntries(
                Object.entries(o).map(([k, v]) =>
                    typeof v === 'number'
                        ? [k, +v.toFixed(2)]
                        : [k, v]
                )
            )
        ).replace(/,/g, ', ');
    }
</script>

<pre>{fmt(brush)}</pre>
<div style="touch-action: none">
    <Plot grid>
        <Dot
            data={penguins}
            x="culmen_length_mm"
            y="culmen_depth_mm"
            stroke="species"
            symbol="species" />

        <Brush bind:brush />
    </Plot>
</div>
```

```svelte
<pre>{JSON.stringify(brush)}</pre>
<Plot grid>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="species"
        symbol="species" />
    <Brush bind:brush />
</Plot>
```

[fork](https://svelte.dev/playground/0f9c8158c19247f9badc0904fc938d2c?version=5)

By default, the Brush mark will use a `<Rect>` mark to render the selection with a dashed outline. You can prevent this by passing `stroke={false}` to the Brush mark. This is useful if you want to highlight the brushed elements in a different way.

```svelte live
<script>
    import { Plot, Dot, Rect, Brush } from 'svelteplot';
    import { page } from '$app/state';

    const { penguins } = $derived(page.data.data);

    let brush = $state({ enabled: false });
</script>

<div style="touch-action: none">
    <Plot grid>
        <Dot
            data={penguins}
            x="culmen_length_mm"
            y="culmen_depth_mm"
            opacity={brush.enabled ? 0.3 : 1}
            stroke={(d) =>
                brush.enabled ? 'gray' : d.species}
            symbol="species" />
        {#if brush.enabled}
            <Rect {...brush} opacity={0.1} />
            <Dot
                data={penguins}
                filter={(d) =>
                    d.culmen_length_mm >= brush.x1 &&
                    d.culmen_length_mm <= brush.x2 &&
                    d.culmen_depth_mm >= brush.y1 &&
                    d.culmen_depth_mm <= brush.y2}
                x="culmen_length_mm"
                y="culmen_depth_mm"
                stroke="species"
                symbol="species" />
        {/if}
        <Brush bind:brush stroke={false} />
    </Plot>
</div>
```

```svelte
<Plot grid>
    <!-- gray symbols if brush is enabled -->
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke={(d) => (brush.enabled ? 'gray' : d.species)}
        opacity={brush.enabled ? 0.3 : 1}
        symbol="species" />
    {#if brush.enabled}
        <!-- custom rectangle to show brush selection -->
        <Rect {...brush} opacity={0.1} />
        <!-- colored symbol inside the brush selection -->
        <Dot
            data={penguins}
            filter={(d) =>
                d.culmen_length_mm >= brush.x1 &&
                d.culmen_length_mm <= brush.x2 &&
                d.culmen_depth_mm >= brush.y1 &&
                d.culmen_depth_mm <= brush.y2}
            x="culmen_length_mm"
            y="culmen_depth_mm"
            stroke="species"
            symbol="species" />
    {/if}
    <Brush bind:brush stroke={false} />
</Plot>
```

[fork](https://svelte.dev/playground/10a9c08e634848aea1f072d9f7cef11e?version=5)

You can limit the brushing dimension using the BrushX and BrushY marks. Here we create an overview + detail time series. Also note how the moving and resizing of the selection is constrained to the plot domains:

```svelte live
<script>
    import {
        Plot,
        Frame,
        Line,
        RectX,
        BrushX
    } from 'svelteplot';
    import { page } from '$app/state';

    const { aapl } = $derived(page.data.data);

    let brush = $state({
        enabled: true,
        x1: new Date(2017, 0, 1),
        x2: new Date(2018, 0, 1)
    });

    const filteredData = $derived(
        brush.enabled
            ? aapl.filter(
                  (d) =>
                      d.Date >= brush.x1 &&
                      d.Date <= brush.x2
              )
            : aapl
    );
</script>

<!-- overview plot -->
<div style="touch-action: none">
    <Plot
        height={90}
        x={{ label: '', grid: true }}
        y={{ axis: false, label: '' }}>
        <Frame opacity={0.4} />
        <Line
            data={aapl}
            x="Date"
            y="Close"
            opacity={0.3} />
        {#if brush.enabled}
            <RectX
                {...brush}
                fill="var(--svp-blue)"
                opacity={0.2} />
            <Line data={filteredData} x="Date" y="Close" />
        {/if}
        <BrushX
            bind:brush
            stroke={false}
            constrainToDomain />
    </Plot>
</div>
<!-- detail plot -->
<Plot
    y={{ insetTop: 10, insetBottom: 10 }}
    grid
    marginBottom={30}>
    <Line data={filteredData} x="Date" y="Close" />
</Plot>
```

```svelte
<!-- brushable overview -->
<Plot height={90}>
    <Frame opacity={0.4} />
    <Line data={aapl} x="Date" y="Close" opacity={0.3} />
    {#if brush.enabled}
        <!-- show highlighted selection -->
        <RectX {...brush} fill="blue" opacity={0.2} />
        <Line data={filteredData} x="Date" y="Close" />
    {/if}
    <BrushX bind:brush stroke={false} constrainToDomain />
</Plot>
<!-- detail plot -->
<Plot grid>
    <Line data={filteredData} x="Date" y="Close" />
</Plot>
```

[fork](https://svelte.dev/playground/5de8299760c6426f9bdf28f6723a20c5?version=5)

Another use case for the Brush mark would be to create a zoomable plot by changing the (tweened) plot domains in the `brushend` event handler:

```svelte live
<script>
    import {
        Plot,
        Dot,
        Rect,
        Brush,
        Frame
    } from 'svelteplot';
    import { Tween } from 'svelte/motion';
    import { cubicInOut } from 'svelte/easing';
    import { page } from '$app/state';
    import { extent } from 'd3-array';

    const { penguins } = $derived(page.data.data);

    let brush = $state({ enabled: false });
    let isZoomedIn = $state(false);

    const fullDomainX = extent(
        penguins,
        (d) => d.culmen_length_mm
    );
    const fullDomainY = extent(
        penguins,
        (d) => d.culmen_depth_mm
    );

    let domainX = $state(fullDomainX);
    let domainY = $state(fullDomainY);

    function resetZoom() {
        domainX = fullDomainX;
        domainY = fullDomainY;
        isZoomedIn = false;
    }

    const domainXT = Tween.of(() => domainX, {
        easing: cubicInOut
    });
    const domainYT = Tween.of(() => domainY, {
        easing: cubicInOut
    });
</script>

<div style="touch-action: none">
    <Plot
        grid
        x={{
            domain: domainXT.current,
            label: 'culmen_length_mm'
        }}
        y={{
            domain: domainYT.current,
            label: 'culmen_depth_mm'
        }}>
        <Dot
            data={penguins}
            x="culmen_length_mm"
            y="culmen_depth_mm"
            stroke="species"
            symbol="species" />
        {#if !isZoomedIn}
            <Brush
                bind:brush
                cursor="zoom-in"
                onbrushend={(e) => {
                    if (e.brush.enabled) {
                        domainX = [e.brush.x1, e.brush.x2];
                        domainY = [e.brush.y1, e.brush.y2];
                        brush.enabled = false;
                        isZoomedIn = true;
                    }
                }} />
        {:else}
            <Frame
                fill="transparent"
                stroke="transparent"
                cursor="zoom-out"
                onpointerup={resetZoom} />
        {/if}
    </Plot>
</div>
```

```svelte
<Brush
    bind:brush
    cursor="zoom-in"
    onbrushend={(e) => {
        if (e.brush.enabled) {
            domainX = [e.brush.x1, e.brush.x2];
            domainY = [e.brush.y1, e.brush.y2];
            e.brush.enabled = false;
        }
    }} />
```

[fork](https://svelte.dev/playground/4a5d9c70f5da4fc5ada8c11cc8b17aa7?version=5)

Note that you cannot use a Brush along a band/point scale:

```svelte live
<script>
    import { Plot, BarX, Brush } from 'svelteplot';
</script>

<Plot>
    <BarX data={[1, 2, 3]} />
    <Brush />
</Plot>
```

```svelte
<Plot>
    <BarX data={[1, 2, 3]} />
    <Brush brush={{ enabled: false }} />
</Plot>
```

But you can still brush along a sequential dimension:

```svelte live
<script>
    import { Plot, BarX, Rect, BrushX } from 'svelteplot';
    let brush = $state({ enabled: false });
    function fmt(o) {
        return JSON.stringify(
            Object.fromEntries(
                Object.entries(o).map(([k, v]) =>
                    typeof v === 'number'
                        ? [k, +v.toFixed(2)]
                        : [k, v]
                )
            )
        ).replace(/,/g, ', ');
    }
</script>

<pre>{fmt(brush)}</pre>
<Plot>
    <BarX data={[1, 2, 4]} opacity={0.5} />
    <BrushX bind:brush />
</Plot>
```

```svelte
<Plot>
    <BarX data={[1, 2, 4]} opacity={0.5} />
    <BrushX bind:brush />
</Plot>
```

[fork](https://svelte.dev/playground/4ec281c3b3544ec2821838b21e1a492c?version=5)

## Brush

Helper mark for brushing 2-dimensional selections along the x and y axes.

### Options

- **brush** - Object containing brush state with x1, x2, y1, y2 coordinates and enabled flag
- **limitDimension** - Restrict brushing to a specific dimension: 'x', 'y', or false (default: false)
- **constrainToDomain** - Constrain resizing/moving of brush inside the plot domain (default: false)
- **resizeHandleSize** - Width of the (invisible) drag resize handle area at the edges of the selection (default: 10)

### Events

The Brush mark provides three event handlers:

- **onbrushstart** - Event handler triggered when brush interaction begins
- **onbrushend** - Event handler triggered when brush interaction ends
- **onbrush** - Event handler triggered during brush movement/resizing

```svelte
<Brush
    onbrush={(e) => {
        console.log('Brushing', e.brush);
    }}
    onbrushend={(e) => {
        console.log('Brush ended', e.brush);
    }} />
```

### Styling

- **stroke** - Color of the brush outline (default: 'currentColor'). Set this to `false` to disable the implicit brush rectangle
- **strokeWidth** - Width of the brush outline
- **strokeDasharray** - Dash pattern for brush outline (default: '2,3')
- **strokeOpacity** - Opacity of the brush outline (default: 0.6)
- **strokeLinecap** - Line cap style for brush outline
- **strokeDashoffset** - Offset for the dash pattern
- **strokeLinejoin** - Line join style for brush outline
- **strokeMiterlimit** - Miter limit for brush outline
- **cursor** - Override default cursor behavior

## BrushX

Helper mark for brushing 1-dimensional selections along the x axis. Shorthand for

```svelte
<Brush limitDimension="x" />
```

## BrushY

Helper mark for brushing 1-dimensional selections along the y axis. Shorthand for

```svelte
<Brush limitDimension="y" />
```
