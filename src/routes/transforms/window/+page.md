---
title: Window transform
---

```svelte live
<script>
    import { Plot, AreaY, Line, windowY } from 'svelteplot';
    import { Slider, Select } from '$shared/ui';
    import { page } from '$app/state';

    let { sftemp } = $derived(page.data.data);
    let k = $state(20);
    let reduce = $state('mean');
    let anchor = $state('middle');
    let strict = $state(false);

    let niceReduce = $derived(
        {
            min: 'minimum',
            max: 'maximum',
            mean: 'average',
            p01: '1-percentile',
            p25: '25-percentile',
            p75: '75-percentile',
            p99: '99-percentile'
        }[reduce] || reduce
    );

    const REDUCE_OPTIONS = [
        'mean',
        'median',
        // 'mode',
        'p01',
        'p25',
        'p75',
        'p99',
        'min',
        'max'
        // 'deviation',
        // 'variance',
        // 'ratio',
        // 'difference'
    ].sort();
</script>

<p>
    For example, the band chart below shows the daily high
    and low temperature in San Francisco. The <span
        style="border-bottom: solid 2px var(--svp-red);"
        >red</span>
    line represents the {k}-day {niceReduce} high, and the
    <span style="border-bottom: solid 2px var(--svp-blue);"
        >blue</span>
    line the {k}-day {niceReduce} low.
</p>

<Slider label="k" min={1} max={100} bind:value={k} />
<Select
    label="reduce"
    options={REDUCE_OPTIONS}
    bind:value={reduce} />
<Select
    label="anchor"
    options={['start', 'middle', 'end']}
    bind:value={anchor} />
<label
    ><input type="checkbox" bind:checked={strict} /> strict</label>
<Plot inset={5}>
    <AreaY
        data={sftemp}
        x="date"
        y1="low"
        y2="high"
        opacity="0.2" />
    <Line
        {...windowY(
            { data: sftemp, x: 'date', y: 'low' },
            { k, anchor, strict, reduce }
        )}
        stroke="var(--svp-blue)" />
    <Line
        {...windowY(
            { data: sftemp, x: 'date', y: 'high' },
            { k, anchor, strict, reduce }
        )}
        stroke="var(--svp-red)" />
    <AreaY
        {...windowY(
            {
                data: sftemp,
                x: 'date',
                y1: 'high',
                y2: 'low'
            },
            { k, anchor, strict, reduce }
        )}
        fillOpacity={0.15}
        fill="yellow"
        mixBlendMode="multiply" />
</Plot>
```

```svelte
<Plot>
    <!-- raw data -->
    <AreaY
        data={sftemp}
        x="date"
        y1="low"
        y2="high"
        opacity="0.2" />
    <!-- line for reduced high temp. -->
    <Line
        {...windowY(
            { data: sftemp, x: 'date', y: 'low' },
            { k, anchor, strict, reduce }
        )}
        stroke="blue" />
    <!-- line for reduced low temp. -->
    <Line
        {...windowY(
            { data: sftemp, x: 'date', y: 'high' },
            { k, anchor, strict, reduce }
        )}
        stroke="red" />
    <!-- area band between reduced high and low temp. -->
    <AreaY
        {...windowY(
            {
                data: sftemp,
                x: 'date',
                y1: 'high',
                y2: 'low'
            },
            { k, anchor, strict, reduce }
        )}
        fillOpacity={0.25}
        fill="yellow"
        mixBlendMode="multiply" />
</Plot>
```

[fork](https://svelte.dev/playground/7d50144c67c74bf0b1363a6b965a9c3b?version=5)

As you see above, the windowY transform will automatically transform any channel of y, y1, and y2 that is defined, so you can use it for area marks as well.

Note that the window transform is series-aware (it groups by z/fill/stroke before computing the windows)

```svelte live
<script>
    import {
        Plot,
        AreaY,
        RectX,
        Line,
        windowY,
        binX,
        groupZ,
        Text,
        selectLast
    } from 'svelteplot';
    import { page } from '$app/state';
    import { Slider } from '$shared/ui';
    import { groups } from 'd3-array';

    let { stocks } = $derived(page.data.data);
    let stocks2 = $derived(
        stocks.filter((d) => d.Date.getFullYear() < 2016)
    );
    let k = $state(90);
    let smoothed = $derived(
        windowY(
            {
                data: stocks,
                x: 'Date',
                y: 'Close',
                z: 'Symbol'
            },
            { k }
        )
    );
</script>

<Slider label="k" min={1} max={120} bind:value={k} />
<Plot grid y={{ type: 'log', base: 5 }} marginRight={75}>
    <RectX
        {...binX(
            {
                data: stocks,
                x: 'Date',
                y1: 'Low',
                y2: 'High',
                fill: 'Symbol'
            },
            { y1: 'min', y2: 'max', interval: '2 weeks' }
        )}
        opacity="0.4"
        strokeWidth="1.5" />
    <Line
        {...smoothed}
        stroke="Symbol"
        strokeWidth="2"
        markerEnd="dot" />
    <Text
        {...selectLast(smoothed)}
        fill="Symbol"
        text="Symbol"
        dx="10"
        textAnchor="start" />
</Plot>
```

```svelte
<script>
    let smoothed = $derived(
        windowY(
            {
                data: stocks2,
                x: 'Date',
                y: 'Close',
                z: 'Symbol'
            },
            { k }
        )
    );
</script>

<Plot
    grid
    y={{ type: 'log', base: 5, domain: [50, 1000] }}
    marginRight={100}>
    <RuleX
        {...binX(
            {
                data: stocks2,
                x: 'Date',
                y1: 'Low',
                y2: 'High',
                z: 'Symbol'
            },
            { y1: 'min', y2: 'max', interval: '3 days' }
        )}
        opacity="0.5"
        strokeWidth="1.5" />
    <Line
        {...smoothed}
        stroke="Symbol"
        strokeWidth="2"
        markerEnd="dot" />
    <Text
        {...selectLast(smoothed)}
        fill="Symbol"
        text="Symbol"
        dx="10"
        textAnchor="start" />
</Plot>
```

Note that _{'{ k: 20 }'}_ doesn't ensure that you're computing a 20-year average, since they may be missing years and the window may include data points outside of a 20-year period. To illustrate this, let's take a look at this dataset of [Cherry Tree Flowering in Kyoto City](http://atmenv.envi.osakafu-u.ac.jp/aono/kyophenotemp4/) by Yasuyuki Aono:

```svelte live
<script lang="ts">
    import {
        Plot,
        Line,
        Dot,
        RectX,
        Area,
        RuleY,
        windowY,
        binX
    } from 'svelteplot';
    import { page } from '$app/state';
    let { cherryblossom } = $derived(page.data.data);

    let data = $derived(
        cherryblossom.map(
            ({ Year, CherryBlossomPeakDay }) => ({
                Year: new Date(Year, 0, 1),
                CherryBlossomPeakDay
            })
        )
    );
</script>

<Plot grid height={250}>
    <Dot
        {data}
        fill="#e7adca"
        x="Year"
        y="CherryBlossomPeakDay"
        opacity="0.5"
        r={2} />
</Plot>
```

```svelte
<Plot grid height={250}>
    <Dot
        data={cherryblossom}
        fill="#e7adca"
        x="Year"
        y="CherryBlossomPeakDay" />
</Plot>
```

If we just use the `windowY` transform with _{'{ k: 20, strict: 5 }'}_ to compute the running mean peak day, we get this:

```svelte live
<script lang="ts">
    import {
        Plot,
        Line,
        Dot,
        RectX,
        Area,
        RuleY,
        windowY,
        binX
    } from 'svelteplot';
    import { page } from '$app/state';
    let { cherryblossom } = $derived(page.data.data);

    let data = $derived(
        cherryblossom.map(
            ({ Year, CherryBlossomPeakDay }) => ({
                Year: new Date(Year, 0, 1),
                CherryBlossomPeakDay
            })
        )
    );

    let movingAverage = $derived(
        windowY(
            { data, x: 'Year', y: 'CherryBlossomPeakDay' },
            { y: 'mean', k: 20, anchor: 'end', strict: 5 }
        )
    );
</script>

<Plot grid height={250}>
    <Dot
        {data}
        fill="#e7adca"
        x="Year"
        y="CherryBlossomPeakDay"
        opacity="0.5"
        r={2} /> -->
    <Line
        {...movingAverage}
        stroke="var(--svelteplot-bg)"
        strokeWidth="4" />
    <Line
        {...movingAverage}
        stroke="var(--svp-red)"
        strokeWidth="2" />
</Plot>
```

The problem is that especially in pre-modern times, there aren't nearly as many data points. To visualize this we can plot the count of measurements over 20-year intervals using the [binX](/transforms/bin) transform:

```svelte live
<script lang="ts">
    import { Plot, Line, Dot, binX } from 'svelteplot';
    import { page } from '$app/state';
    let { cherryblossom } = $derived(page.data.data);

    let data = $derived(
        cherryblossom.map(
            ({ Year, CherryBlossomPeakDay }) => ({
                Year: new Date(Year, 0, 1),
                CherryBlossomPeakDay
            })
        )
    );
</script>

<Plot
    grid
    y={{ label: 'Measurement count in 20-year interval' }}
    height={250}>
    <Line
        {...binX(
            { data, x: 'Year' },
            { interval: '20 years', y: 'count' }
        )}
        curve="step-after" />
</Plot>
```

```svelte
<Plot grid height={250}>
    <Line
        {...binX(
            { data, x: 'Year' },
            { interval: '20 years', y: 'count' }
        )}
        curve="step-after" />
</Plot>
```

This means that 20 rows of our dataset will span a lot more than 20 years, and therefore the average is no longer based on 20-year periods!

We can fix this problem by setting the _interval_ option of the window transform to `'year'`. Now the window will be based on the time period instead of the row count. Note that this introduces gaps in the moving average line since there are times where we just can't compute the 20-year average!

```svelte live
<script lang="ts">
    import {
        Plot,
        Line,
        Dot,
        RectX,
        Area,
        RuleY,
        windowY,
        binX
    } from 'svelteplot';
    import { Slider } from '$shared/ui';
    import { page } from '$app/state';
    let { cherryblossom } = $derived(page.data.data);

    let data = $derived(
        cherryblossom.map(
            ({ Year, CherryBlossomPeakDay }) => ({
                Year: new Date(Year, 0, 1),
                CherryBlossomPeakDay
            })
        )
    );

    let strict = $state(5);

    let movingAverage = $derived(
        windowY(
            { data, x: 'Year', y: 'CherryBlossomPeakDay' },
            {
                y: 'mean',
                k: 20,
                interval: 'year',
                anchor: 'end',
                strict
            }
        )
    );
</script>

<Slider
    label="strict"
    min={1}
    max={20}
    bind:value={strict} />
<Plot grid height={250}>
    <Dot
        {data}
        fill="#e7adca"
        opacity="0.5"
        x="Year"
        y="CherryBlossomPeakDay"
        r={2} /> -->

    <Line
        {...movingAverage}
        stroke="var(--svelteplot-bg)"
        strokeWidth="4" />
    <Line
        {...movingAverage}
        stroke="var(--svp-red)"
        strokeWidth="2" />
</Plot>
```

```svelte
<Plot grid height={250}>
    <Dot
        {data}
        fill="#e7adca"
        x="Year"
        y="CherryBlossomPeakDay"
        r={2} />
    <Line
        {...windowY(
            { data, x: 'Year', y: 'CherryBlossomPeakDay' },
            {
                y: 'mean',
                k: 20,
                interval: 'year',
                anchor: 'end',
                strict
            }
        )}
        stroke="red"
        strokeWidth="2" />
</Plot>
```

## windowX

[API Reference](/api/transforms#windowX)

## windowY

[API Reference](/api/transforms#windowY)
