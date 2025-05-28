---
title: Test
---

```svelte live
<script>
    import { Plot, Rect } from 'svelteplot';
</script>

<Plot>
    <Rect
        data={[{ x1: 10, x2: 60, y1: -30, y2: 20 }]}
        x1="x1"
        x2="x2"
        y1="y1"
        y2="y2"
        opacity={0.5} />
</Plot>
```

Link to [empty page](empty).

```svelte --live
<script>
    import { Plot, Line, RectX } from 'svelteplot';

    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot>
    <!-- <Line data={aapl} x="Date" y="Close" /> -->
    <RectX
        data={[
            {
                from: new Date(2014, 0, 1),
                to: new Date(2016, 0, 1)
            }
        ]}
        x1="from"
        x2="to"
        fillOpacity={0.1} />
</Plot>
```

```svelte
<script lang="ts">
    import { css } from '@emotion/css';
    import {
        Plot,
        Line,
        Dot,
        AreaY,
        RectX
    } from 'svelteplot';
    import { Slider } from '$lib/ui';

    import { page } from '$app/state';
    let { aapl, penguins } = $derived(page.data.data);
    let inset = $state(10);
    let year = $state(2015);

    const data = $derived([
        {
            x1: new Date(year, 0, 1),
            x2: new Date(2016, 0, 1)
        },
        {
            x1: new Date(2017, 0, 1),
            x2: new Date(2018, 0, 1)
        }
    ]);
</script>

<Slider
    bind:value={year}
    label="year"
    min={2000}
    max={2030} />
<Slider bind:value={inset} min={-20} max={30} />

<Plot grid frame marginTop={35} {inset}>
    <Line data={aapl} x="Date" y="Close" />
    <!-- <RectX
        data={data}
        fill="currentColor"
        x1="x1"
        x2="x2"
        opacity={0.5} /> -->
    <!-- <Dot
        data={penguins}
        fx="species"
        fy="sex"
        fill
        onmouseenter={(d, e) => console.log(e)}
        x="culmen_length_mm"
        y="culmen_depth_mm" /> -->
</Plot>
```
