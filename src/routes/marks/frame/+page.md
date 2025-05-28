---
title: Frame mark
---

The <b>frame</b> mark can be used to add a rectangle outside your plot boundaries. The
easiest way to add a frame is to set the <b>frame</b> option of the Plot element

```svelte live
<script>
    import { Plot, Line } from 'svelteplot';
    import { page } from '$app/state';
    const { aapl } = $derived(page.data.data);
</script>

<Plot grid frame>
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

```svelte
<Plot grid frame>
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

If you need more customization options, you can add the frame manually by explicitly adding the <b
        >Frame</b
    > mark to your plot:

```svelte live
<script>
    import { Plot, Frame, Line } from 'svelteplot';
    import { page } from '$app/state';
    const { aapl } = $derived(page.data.data);
</script>

<Plot grid testid="frame-demo" inset={20}>
    <Frame
        fill="yellow"
        fillOpacity="0.2"
        stroke="magenta"
        strokeWidth="2"
        strokeDasharray="4,4" />
    <Frame inset="4" borderRadius={5} />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

```svelte
<Plot grid inset={20}>
    <Frame
        fill="yellow"
        fillOpacity="0.2"
        stroke="magenta"
        strokeWidth="2"
        strokeDasharray="4,4" />
    <Frame inset="4" borderRadius={5} />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

You can use the explicit frame and grid marks to create ggplot style charts:

```svelte live
<script lang="ts">
    import {
        Plot,
        Frame,
        Line,
        GridX,
        GridY
    } from '$lib/index.js';
    import { page } from '$app/state';
    const { aapl } = $derived(page.data.data);
</script>

<Plot testid="frame-demo" inset={10}>
    <Frame fill="#eaeaea" stroke="none" />
    <GridX stroke="#fff" strokeOpacity={1} />
    <GridY stroke="#fff" strokeOpacity={1} />
    <Line data={aapl} x="Date" y="Close" stroke="#222" />
</Plot>
```

```svelte
<Plot inset={10}>
    <Frame fill="#eaeaea" />
    <GridX stroke="#fff" />
    <GridY stroke="#fff" />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```
