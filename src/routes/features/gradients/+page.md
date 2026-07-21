---
title: Gradients
---

While SveltePlot allows you to use any SVG gradients, you can also make use of the [LinearGradientX](#LinearGradientX) and [LinearGradientY](#LinearGradientY) helpers, which allow mapping data to gradient stops.

## LinearGradientX

For horizontal gradients (= from left to right)

**Options:**

- **id** - the gradient id to be used in `url(#...)` fills and strokes
- **stops** - a list of `({ x, color })` pairs, with x coordinates defined in data space

```svelte live
<script lang="ts">
  import {
    Plot,
    Line,
    RuleY,
    LinearGradientX
  } from 'svelteplot';
  import { page } from '$app/state';
  let { aapl } = $derived(page.data.data);
</script>

<Plot height={250} x={{ grid: true }}>
  <defs>
    <LinearGradientX
      id="gradientx"
      stops={[
        {
          x: new Date(2014, 0, 1),
          color: 'cyan'
        },
        {
          x: new Date(2016, 0, 1),
          color: 'magenta'
        },

        {
          x: new Date(2018, 0, 1),
          color: 'gold'
        }
      ]} />
  </defs>
  <Line
    data={aapl}
    x="Date"
    y="Close"
    stroke="url(#gradientx)" />
</Plot>
```

```svelte
<Plot height={250} x={{ grid: true }}>
  <defs>
    <LinearGradientX
      id="gradientx"
      stops={[
        {
          x: new Date(2014, 0, 1),
          color: 'cyan'
        },
        {
          x: new Date(2016, 0, 1),
          color: 'magenta'
        },

        {
          x: new Date(2018, 0, 1),
          color: 'gold'
        }
      ]} />
  </defs>
  <Line
    data={aapl}
    x="Date"
    y="Close"
    stroke="url(#gradientx)" />
</Plot>
```

[fork](https://svelte.dev/playground/ef606d66499d444bbf10bde9663909e6?version=5)

## LinearGradientY

For vertical gradients (from top to bottom)

**Options:**

- **id** - the gradient id to be used in `url(#...)` fills and strokes
- **stops** - a list of `({ y, color })` pairs, y coordinates defined in data space

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

<Plot marginRight={10} height={250} y={{ grid: true }}>
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
    canvas
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
    canvas
    stroke="url(#temp-gradient)" />
</Plot>
```

[fork](https://svelte.dev/playground/20b8564678c842f5bd23133780bc255d?version=5)
