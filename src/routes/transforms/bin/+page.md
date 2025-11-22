---
title: Bin transform
---

:::caution
The bin transform in SveltePlot takes different options than the bin transform in Plot.
:::

The bin transform groups quantitative or temporal data — continuous measurements such as heights, weights, or temperatures — into discrete bins. You can then compute summary statistics for each bin, such as a count, sum, or proportion.

For example, here is a histogram showing the distribution of weights of Olympic athletes.

```svelte live
<script>
    import {
        Plot,
        Rect,
        RectY,
        RuleY,
        binX,
        stackY
    } from 'svelteplot';

    import { page } from '$app/state';
    let { olympians } = $derived(page.data.data);
</script>

<Plot height={300}>
    <RectY
        {...binX(
            { data: olympians, x: 'weight' },
            { y: 'count' }
        )} />
</Plot>
```

```svelte
<Plot height={300}>
    <RectY
        {...binX(
            { data: olympians, x: 'weight' },
            { y: 'count' }
        )} />
</Plot>
```

[Fork](https://svelte.dev/playground/41c71f19e4d24caaae1854f8a7693c1c?version=5)

The [binX](#binX) transform takes **x** as input and outputs **x1** and **x2** representing the extent of each bin in _x_. The _outputs_ argument (here `y: "count"`) declares additional output channels (**y**) and the associated reducer (_count_). Hence the height of each rect above represents the number of athletes in the corresponding bin, _i.e._, the number of athletes with a similar weight.

```svelte live
<script>
    import {
        Plot,
        Rect,
        RectY,
        RuleY,
        binX,
        stackY
    } from 'svelteplot';

    import { getContext } from 'svelte';
    import { SVELTEPRESS_CONTEXT_KEY } from '$theme/context';
    const { isDark } = getContext(SVELTEPRESS_CONTEXT_KEY);

    import { page } from '$app/state';
    let { olympians } = $derived(page.data.data);
</script>

<Plot color={{ scheme: $isDark ? 'turbo' : 'YlGnBu' }}>
    <RectY
        {...binX(
            { data: olympians, x: 'weight', fy: 'sex' },
            { fill: 'count' }
        )} />
</Plot>
```

```svelte
<Plot color={{ scheme: $isDark ? 'turbo' : 'YlGnBu' }}>
    <RectY
        {...binX(
            { data: olympians, x: 'weight', fy: 'sex' },
            { fill: 'count' }
        )} />
</Plot>
```

Alternatively, you can also map to the _r_ channel.

```svelte live
<script>
    import { Plot, DotX, binX } from 'svelteplot';
    import Mark from '$lib/Mark.svelte';
    import { page } from '$app/state';
    let { olympians } = $derived(page.data.data);

    let args = $derived(
        binX(
            {
                data: olympians,
                x: 'weight',
                sort: { channel: 'r' }
            },
            { r: 'count' }
        )
    );
</script>

{#if olympians}
    <Plot testid="olympians-binned">
        <DotX {...args} />
    </Plot>
{/if}
```

```svelte live
<script>
    import { Plot, DotX, binX } from 'svelteplot';
    import Mark from '$lib/Mark.svelte';
    import { page } from '$app/state';
    let { olympians } = $derived(page.data.data);
</script>

<Plot testid="olympians-binned" y={{ grid: true }}>
    <DotX
        {...binX(
            {
                data: olympians,
                x: 'weight',
                fy: 'sex',
                sort: { channel: 'r' }
            },
            { r: 'count' }
        )} />
</Plot>
```

```svelte
<Plot y={{ grid: true }}>
    <DotX
        {...binX(
            {
                data: olympians,
                x: 'weight',
                fy: 'sex'
            },
            { r: 'count' }
        )} />
</Plot>
```

You can also bin and group at the same time:

```svelte live
<script>
    import {
        Plot,
        Rect,
        RectY,
        RuleY,
        binX,
        stackY
    } from 'svelteplot';

    import { page } from '$app/state';
    let { olympians } = $derived(page.data.data);
</script>

<Plot
    height={300}
    grid
    marginLeft={40}
    color={{ legend: true }}>
    <RectY
        {...binX(
            { data: olympians, x: 'weight', fill: 'sex' },
            { y: 'count' }
        )} />
    <RuleY data={[0]} />
</Plot>
```

```svelte
<Plot height={300}>
    <RectY
        {...binX(
            { data: olympians, x: 'weight', fill: 'sex' },
            { y: 'count' }
        )} />
</Plot>
```

You can opt-out of the implicit stackY transform by having binX generate **y1** or **y2** instead of **y** (and similarly **x1** or **x2** for stackX and binY). When overlapping marks, use either opacity or blending to make the overlap visible.

```svelte live
<script>
    import {
        Plot,
        Rect,
        RectY,
        RuleY,
        binX,
        stackY
    } from 'svelteplot';

    import { getContext } from 'svelte';
    import { SVELTEPRESS_CONTEXT_KEY } from '$theme/context';
    const { isDark } = getContext(SVELTEPRESS_CONTEXT_KEY);

    import { page } from '$app/state';
    let { olympians } = $derived(page.data.data);
</script>

<Plot
    height={300}
    grid
    marginLeft={40}
    color={{ legend: true }}>
    <RectY
        {...binX(
            {
                data: olympians,
                x: 'weight',
                fill: 'sex',
                y1: 0
            },
            { y2: 'count' }
        )}
        blend={$isDark ? 'screen' : 'multiply'} />
    <RuleY data={[0]} />
</Plot>
```

```svelte
<Plot height={300}>
    <RectY
        {...binX(
            {
                data: olympians,
                x: 'weight',
                fill: 'sex',
                y1: 0
            },
            { y2: 'count' }
        )}
        blend={$isDark ? 'screen' : 'multiply'} />
    <RuleY data={[0]} />
</Plot>
```

:::caution
While the mixBlendMode option is useful for mitigating occlusion, it can be slow to render if there are many elements. More than two overlapping histograms may also be hard to read.
:::

The bin transform comes in three orientations:

- [binX](/transforms/bin#binX) bins on **x**, and often outputs **y** as in a histogram with vertical↑ rects;
- [binY](/transforms/bin#binY) bins on **y**, and often outputs **x** as in a histogram with horizontal→ rects; and
- [bin](/transforms/bin#bin) bins on both **x** and **y**, and often outputs to **fill** or **r** as in a heatmap.

As you might guess, the binY transform with the rectX mark produces a histogram with horizontal→ rects.

By default, the binX transform will set the _insetRight_ channel to 1, but you can disable this by explicitly setting it to zero:

```svelte live
<script>
    import {
        Plot,
        Rect,
        RectY,
        RuleY,
        binX,
        stackY
    } from 'svelteplot';

    import { page } from '$app/state';
    let { olympians } = $derived(page.data.data);
</script>

<Plot height={200}>
    <RectY
        {...binX(
            { data: olympians, x: 'weight' },
            { y: 'count' }
        )}
        insetLeft={0}
        insetRight="0" />
    <RuleY data={[0]} />
</Plot>
```

```svelte
<Plot height={200}>
    <RectY
        {...binX(
            { data: penguins, x: 'culmen_length_mm' },
            { y: 'count' },
            { thresholds: [0, 35, 40, 41, 45, 53, 80] }
        )}
        insetLeft="0"
        insetRight="0" />
    <RuleY data={[0]} />
</Plot>
```

## Bin options

The supported bin options are:

- the output channels to be computed for each bin. For binX the supported outputs are _y_, _y1_, and _y2_, for binY the outputs are _x_, _x1_, and _x2_.
- **thresholds** defines how the bin thresholds should be computed (see examples below)
- **interval** in addition to thresholds you can also define the interval at which the bin thresholds should be computed
- **reverse**
- **cumulative**

You can define _thresholds_ as a number

```svelte live
<script>
    import { Plot, RectY, RuleY, binX } from 'svelteplot';
    import Slider from '$lib/ui/Slider.svelte';

    import { page } from '$app/state';
    let { olympians } = $derived(page.data.data);

    let thresholds = $state(20);
</script>

<Slider
    min={10}
    max={100}
    step={10}
    label="thresholds"
    bind:value={thresholds} />
<Plot grid marginLeft={50} height={200}>
    <RectY
        {...binX(
            { data: olympians, x: 'weight' },
            { y: 'count', thresholds }
        )} />
    <RuleY data={[0]} />
</Plot>
```

You can also define an _interval_. For numeric scales intervals are defined as number, for temporal scales intervals are defined as named time period, such as "week" or "10 days"

```svelte live
<script>
    import { Plot, RectY, RuleY, binX } from 'svelteplot';
    import Slider from '$lib/ui/Slider.svelte';

    import { page } from '$app/state';
    let { olympians } = $derived(page.data.data);

    let interval = $state(10);
</script>

<Slider
    min={1}
    max={40}
    step={1}
    label="interval"
    bind:value={interval} />
<Plot grid marginLeft={50} height={200}>
    <RectY
        {...binX(
            { data: olympians, x: 'weight' },
            { y: 'count', interval }
        )} />
    <RuleY data={[0]} />
</Plot>
```

Or as arbitrary bin bounds, passed as array of values via **thresholds**:

```svelte live
<script>
    import { Plot, RectY, RuleY, binX } from 'svelteplot';

    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot height={200}>
    <RectY
        {...binX(
            { data: penguins, x: 'culmen_length_mm' },
            {
                y: 'count',
                thresholds: [0, 35, 40, 41, 45, 53, 80]
            }
        )} />
    <RuleY data={[0]} />
</Plot>
```

```svelte
<Plot height={200}>
    <RectY
        {...binX(
            {
                data: penguins,
                x: 'culmen_length_mm',
                y: 'count'
            },
            { thresholds: [0, 35, 40, 41, 45, 53, 80] }
        )} />
    <RuleY data={[0]} />
</Plot>
```

If you want to compute statistics for each bin other than `count`, you also need to define the input channel corresponding to the output channel. In the next example, we're computing the median height for each bin, grouped by sex:

```svelte live
<script>
    import { Plot, Dot, binX } from 'svelteplot';

    import { page } from '$app/state';
    let { olympians } = $derived(page.data.data);
</script>

<Plot height={300} grid color={{ legend: true }}>
    <Dot
        {...binX(
            {
                data: olympians,
                x: 'weight',
                fill: 'sex',
                y: 'height'
            },
            { y: 'median' }
        )} />
</Plot>
```

```svelte
<Plot grid color={{ legend: true }}>
    <Dot
        {...binX(
            {
                data: olympians,
                x: 'weight',
                fill: 'sex',
                y: 'height'
            },
            {
                y: 'mean'
            }
        )} />
</Plot>
```

Here's an example where we use the bin transform to compute weekly aggregates from daily data to produce a candlestick type chart:

```svelte live
<script>
    import {
        Plot,
        Line,
        RectY,
        RuleX,
        binX
    } from 'svelteplot';
    import { Select } from '$lib/ui';

    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);

    let interval = $state('week');
    const INTERVALS = [
        '2 days',
        '4 days',
        'week',
        '2 weeks',
        '3 weeks',
        'month',
        '2 months',
        '3 months'
    ];
</script>

<Select
    bind:value={interval}
    options={INTERVALS}
    label="Interval: " />
<Plot grid>
    <RuleX
        {...binX(
            {
                data: aapl.slice(-500),
                x: 'Date',
                y1: 'High',
                y2: 'Low'
            },
            { y1: 'max', y2: 'min', interval: interval }
        )}
        opacity="0.6" />
    <RectY
        {...binX(
            {
                data: aapl.slice(-500),
                x: 'Date',
                y1: 'Open',
                y2: 'Close'
            },
            { y1: 'first', y2: 'last', interval: interval }
        )}
        fill={(d) =>
            d.__y1 > d.__y2
                ? 'var(--svp-red)'
                : 'var(--svp-green)'} />
</Plot>
```

```svelte
<Plot grid>
    <!-- rules from max(High) to min(Low) -->
    <RuleX
        {...binX(
            {
                data: aapl,
                x: 'Date',
                y1: 'High',
                y2: 'Low'
            },
            { interval: 'week', y1: 'max', y2: 'min' }
        )}
        opacity="0.5" />
    <!-- rects from first(Open) to last(Close) -->
    <RectY
        {...binX(
            {
                data: aapl,
                x: 'Date',
                y1: 'Open',
                y2: 'Close'
            },
            { interval: 'week', y1: 'first', y2: 'last' }
        )}
        fill={(d) => (d.__y1 > d.__y2 ? 'red' : 'green')} />
</Plot>
```

You can also map to _r_ as output channel:

```svelte live
<script>
    import { Plot, Dot, bin } from 'svelteplot';
    import Mark from '$lib/Mark.svelte';
    import { page } from '$app/state';
    let { olympians } = $derived(page.data.data);

    let args = $derived(
        bin(
            {
                data: olympians,
                x: 'weight',
                y: 'height',
                sort: { channel: 'r' }
            },
            { r: 'count' }
        )
    );
</script>

{#if olympians}
    <Plot
        testid="olympians-binned"
        color={{ scheme: 'OrRd' }}>
        <Dot {...args} opacity={0.75} />
    </Plot>
{/if}
```

## bin

For two-dimensional binning.

```js
let { data, ...channels } = bin(
    { data, ...input },
    { ...options, ...output }
);
```

Requires _input_ channels _x_ and _y_. Valid output channels for `bin()` are _fill_, _stroke_, _opacity_, _fillOpacity_, and _strokeOpacity_. See [options](#Bin-options) for more details.

```svelte live
<script>
    import { Plot, Rect, bin } from 'svelteplot';
    import Mark from '$lib/Mark.svelte';
    import { page } from '$app/state';
    let { olympians } = $derived(page.data.data);
    import { getContext } from 'svelte';
    import { SVELTEPRESS_CONTEXT_KEY } from '$theme/context';
    const { isDark } = getContext(SVELTEPRESS_CONTEXT_KEY);

    let args = $derived(
        bin(
            { data: olympians, x: 'weight', y: 'height' },
            { fill: 'count' }
        )
    );
</script>

{#if olympians}
    <Plot
        testid="olympians-binned"
        color={{ scheme: $isDark ? 'turbo' : 'YlGnBu' }}>
        <Rect {...args} inset={0} />
    </Plot>
{/if}
```

## binX

    binX({ data, ...input }, { ...options, ...output })

Requires input channel _x_. Valid output channels for `binX()` are _y_, _y1_, _y2_, _r_, _fill_, _stroke_, _opacity_, _fillOpacity_, and _strokeOpacity_. See [options](#Bin-options) for more details.

```svelte
<script>
    let { data, ...channels } = binX(
        { data, x: 'weight' },
        { y: 'count' }
    );
</script>
```

Demo with area

```svelte live
<script>
    import { Plot, Line, AreaY, binX } from 'svelteplot';

    import { page } from '$app/state';
    const { aapl } = $derived(page.data.data);

    const r = $derived(
        binX(
            {
                data: aapl,
                x: 'Date',
                y1: 'Close',
                y2: 'Close'
            },
            { interval: '3 weeks', y1: 'min', y2: 'max' }
        )
    );
</script>

<Plot x={{ grid: true }}>
    <AreaY
        curve="basis"
        fill="var(--svp-red)"
        opacity={0.2}
        {...binX(
            {
                data: aapl,
                x: 'Date',
                y1: 'Close',
                y2: 'Close'
            },
            { interval: '5 weeks', y1: 'min', y2: 'max' }
        )} />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

## binY

    binY({ data, ...input }, { ...options, ...output })

Requires input channel _y_. Valid output channels for `binY()` are _x_, _x1_, _x2_, _r_, _fill_, _stroke_, _opacity_, _fillOpacity_, and _strokeOpacity_. See [options](#Bin-options) for more details.

```svelte live
<script>
    import { Plot, RectX, RuleX, binY } from 'svelteplot';

    import { page } from '$app/state';
    let { olympians } = $derived(page.data.data);
</script>

<Plot x={{ grid: true }}>
    <RectX
        {...binY(
            { data: olympians, y: 'weight' },
            { x: 'count' }
        )} />
    <RuleX data={[0]} />
</Plot>
```

```svelte
<Plot x={{ grid: true }}>
    <RectX
        {...binY(
            { data: olympians, y: 'weight' },
            { x: 'count' }
        )} />
    <RuleX data={[0]} />
</Plot>
```
