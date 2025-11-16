---
title: Rule mark
---

Rules can be used for highlighting certain axis values but they can also be used to show data. Rules come in two variants: [RuleX](#RuleX) for vertical lines (located along the x scale) and [RuleY](#RuleY) for horizontal lines (located along the y scale).

```svelte
<Plot>
    <RuleY y={0} />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

```svelte live
<script lang="ts">
    import { Plot, Line, RuleY } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot height={350}>
    <RuleY y={0} />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

Like most other marks, rules also accept data for displaying multiple lines at once:

```svelte
<Plot>
    <RuleY
        data={[50, 100, 150]}
        strokeDasharray="3,3"
        opacity={0.5} />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

```svelte live
<script lang="ts">
    import { Plot, Line, RuleY } from 'svelteplot';
    import type { Datasets } from '$lib/types/index.js';

    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot height={350}>
    <RuleY
        data={[50, 100, 150]}
        strokeDasharray="3,3"
        opacity={0.5} />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

:::info
While you can use rules for adding grid lines to your plot, you may also want to consider using the special [Grid](/marks/grid) marks, which synchronize the lines with Axis mark ticks.
:::

Rules can be used for barcode plots:

```svelte live
<script lang="ts">
    import { Plot, RuleX } from '$lib/index.js';
    import { range } from 'd3-array';
    import { randomNormal, randomLcg } from 'd3-random';

    const seededNormal = randomNormal.source(
        randomLcg(0.12345)
    );
</script>

<Plot>
    <RuleX
        data={range(500).map(seededNormal(0, 1))}
        strokeOpacity={0.5} />
</Plot>
```

```svelte
<Plot>
    <RuleX
        data={range(500).map(seededNormal(0, 1))}
        strokeOpacity={0.5} />
</Plot>
```

Or candlestick ([demo](https://svelte.dev/playground/f2b2ada0c65d403c92777250c14a740a))

```svelte
<Plot grid>
    <RuleX
        data={aapl.slice(750, 800)}
        x="Date"
        y1="Low"
        y2="High"
        strokeWidth="2"
        opacity="0.3" />
    <RuleX
        data={aapl.slice(750, 800)}
        x="Date"
        y1="Open"
        y2="Close"
        strokeWidth="5"
        stroke={(d) =>
            d.Close > d.Open ? 'green' : 'red'} />
</Plot>
```

```svelte live
<script lang="ts">
    import { Plot, RuleX } from '$lib/index.js';

    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot grid height={250} testid="candlestick">
    <RuleX
        data={aapl.slice(750, 800)}
        x="Date"
        y1="Low"
        y2="High"
        strokeWidth="2"
        opacity="0.5" />
    <RuleX
        data={aapl.slice(750, 800)}
        x="Date"
        y1="Open"
        y2="Close"
        strokeWidth="5"
        stroke={(d) =>
            (d as AAPL).Close > (d as AAPL).Open
                ? 'var(--svp-green)'
                : 'var(--svp-red)'} />
</Plot>
```

## RuleX

For vertical lines

- **x** - required
- **y1** - optional start of the line
- **y2** - optional end of the line

## RuleY

For horizontal lines

- **y** - required
- **x1** - optional start of the line
- **x2** - optional end of the line
