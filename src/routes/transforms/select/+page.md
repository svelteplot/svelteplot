---
title: Select transform
---

The select transform filters a mark’s index to show a subset of the data. For example, below selectLast is used to label the last value in a line chart.

```svelte live
<script>
    import {
        Plot,
        Line,
        RuleY,
        selectLast,
        Text
    } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot grid marginRight={30}>
    <Text
        {...selectLast({
            data: aapl,
            x: 'Date',
            y: 'Close'
        })}
        lineAnchor="bottom"
        dy="-5"
        text={(d) => d.Close.toFixed(1)} />
    <Line data={aapl} x="Date" y="Close" markerEnd />
    <RuleY data={[0]} />
</Plot>
```

```svelte
<Plot grid marginRight={30}>
    <Text
        {...selectLast({
            data: aapl,
            x: 'Date',
            y: 'Close'
        })}
        lineAnchor="bottom"
        dy="-5"
        text={(d) => d.Close.toFixed(1)} />
    <Line data={aapl} x="Date" y="Close" markerEnd />
    <RuleY data={[0]} />
</Plot>
```

The select transform uses input order, not natural order by value, to determine the meaning of _first_ and _last_. Since this dataset is in reverse chronological order, the first element is the most recent.

Using _selectMinY_ and _selectMaxY_, you can label the extreme values.

```svelte live
<script>
    import {
        Plot,
        Line,
        RuleY,
        selectMinY,
        selectMaxY,
        Text
    } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot grid marginRight={30}>
    <Text
        {...selectMinY({
            data: aapl,
            x: 'Date',
            y: 'Close'
        })}
        lineAnchor="top"
        dy="5"
        text={(d) => d.Close.toFixed(1)} />
    <Text
        {...selectMaxY({
            data: aapl,
            x: 'Date',
            y: 'Close'
        })}
        lineAnchor="bottom"
        dy="-5"
        text={(d) => d.Close.toFixed(1)} />
    <Line data={aapl} x="Date" y="Close" />
    <RuleY data={[0]} />
</Plot>
```

```svelte
<Plot grid marginRight={30}>
    <Text
        {...selectMinY({
            data: aapl,
            x: 'Date',
            y: 'Close'
        })}
        lineAnchor="top"
        dy="5"
        text={(d) => d.Close.toFixed(1)} />
    <Text
        {...selectMaxY({
            data: aapl,
            x: 'Date',
            y: 'Close'
        })}
        lineAnchor="bottom"
        dy="-5"
        text={(d) => d.Close.toFixed(1)} />
    <Line data={aapl} x="Date" y="Close" />
    <RuleY data={[0]} />
</Plot>
```

The select transform groups data into series using the **z**, **fill**, or **stroke** channel in the same fashion as the [area](/marks/area) and [line](/marks/line) marks. Below, the select transform is used to label the last point in each series of a multi-series line chart.

```svelte live
<script>
    import {
        Plot,
        Line,
        RuleY,
        selectLast,
        Text
    } from 'svelteplot';
    import { page } from '$app/state';
    let { stocks } = $derived(page.data.data);
</script>

<Plot grid marginRight={50}>
    <Text
        {...selectLast({
            data: stocks,
            x: 'Date',
            y: 'Close',
            fill: 'Symbol'
        })}
        textAnchor="start"
        dx="5"
        text="Symbol" />
    <Line
        data={stocks}
        x="Date"
        y="Close"
        stroke="Symbol"
        markerEnd />
    <RuleY data={[0]} />
</Plot>
```

```svelte
<Plot grid marginRight={50}>
    <Text
        {...selectLast({
            data: stocks,
            x: 'Date',
            y: 'Close',
            fill: 'Symbol'
        })}
        textAnchor="start"
        dx="5"
        text="Symbol" />
    <Line
        data={stocks}
        x="Date"
        y="Close"
        stroke="Symbol"
        markerEnd />
    <RuleY data={[0]} />
</Plot>
```

## selectMaxY

[API Reference](/api/transforms#selectMaxY)

Selects the data point in each group with the largest y value.

## selectMinY

[API Reference](/api/transforms#selectMinY)

Selects the data point in each group with the smallest y value.

## selectFirst

[API Reference](/api/transforms#selectFirst)

Selects the data point in each group with the smallest x value.

## selectLast

[API Reference](/api/transforms#selectLast)

Selects the data point in each group with the largest x value.
