---
title: Interval transform
---

The **interval transform** turns a quantitative or temporal value into a continuous extent [start, stop]. For example, if value is an instant in time, the interval transform could return a start of UTC midnight and a stop of the UTC midnight the following day.

The interval transform is often used for time-series bar charts. For example, consider the chart below of the daily trade volume of Apple stock. Because of the [barY](/marks/bar) mark, the x scale is ordinal _(band)_. And because the regularity of the data is not specified (i.e., because Plot has no way of knowing that this is daily data), every distinct value must have its own label, leading to crowding. If a day were missing data, it would be difficult to spot! 👓

```svelte live
<script lang="ts">
    import { Plot, BarY, RuleY } from 'svelteplot';

    const DAY_MONTH = new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short'
    });

    const tickFormat = (date: Date) =>
        DAY_MONTH.format(date).split(' ').reverse();

    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot marginLeft={40} x={{ tickFormat }} grid>
    <BarY data={aapl.slice(-40)} x="Date" y="Volume" />
    <RuleY data={[0]} />
</Plot>
```

In contrast, a [rectY](/marks/rect) mark with the interval option and the day interval produces a temporal (utc) x scale. This allows Plot to compute ticks at meaningful intervals: here weekly boundaries, UTC midnight on Sundays. Furthermore, we can see that this isn’t truly daily data — it’s missing weekends and holidays when the stock market was closed.

```svelte live
<script lang="ts">
    import { Plot, RectY, RuleY } from 'svelteplot';
    import type { Datasets } from '$lib/types.js';

    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);

    const DAY_MONTH = new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short'
    });
    const tickFormat = (date: Date) =>
        DAY_MONTH.format(date).split(' ').reverse();
</script>

<Plot marginLeft={40} x={{ tickFormat }} grid>
    <RectY
        data={aapl.slice(-40)}
        x="Date"
        y="Volume"
        interval="day"
        insetRight={1} />
    <RuleY data={[0]} />
</Plot>
```

```svelte
<Plot marginLeft={40} x={{ tickFormat }} grid>
    <RectY
        data={aapl.slice(-40)}
        x="Date"
        y="Volume"
        interval="day"
        insetRight={1} />
    <RuleY data={[0]} />
</Plot>
```

The meaning of the interval mark option depends on the associated mark, such as line, bar, rect, or dot. For example, for the [barY mark](/marks/bar), the interval option affects converts a singular y value into an interval [y1, y2]. In the contrived example below, notice that the vertical↕︎ extent of each bar spans an interval of 5 million, rather than extending to y = 0.

```svelte live
<script lang="ts">
    import { Plot, BarY, RuleY } from 'svelteplot';
    import type { Datasets } from '$lib/types.js';

    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);

    const DAY_MONTH = new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short'
    });

    const tickFormat = (date: Date) =>
        DAY_MONTH.format(date).split(' ').reverse();
</script>

<Plot marginLeft={40} x={{ tickFormat }} grid>
    <BarY
        data={aapl.slice(-40)}
        x="Date"
        y="Volume"
        interval={5e6} />
    <RuleY data={[0]} />
</Plot>
```

```svelte
<Plot
    marginLeft={40}
    x={{
        /* force date ticks for band scale */
        tickFormat
    }}
    grid>
    <BarY
        data={aapl.slice(-40)}
        x="Date"
        y="Volume"
        interval={5e6} />
    <RuleY data={[0]} />
</Plot>
```

While the **interval** option is most commonly specified as a named time interval or a number, it can also be specified as a [D3 time interval](https://d3js.org/d3-time#_interval) or any object that implements _interval_.floor and _interval_.offset.
