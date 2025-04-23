---
title: Axis mark
---

Axis marks are useful for rendering the x and y axes! Since they are useful in 95% of plots, SveltePlot will create axis marks by default (implicit axes):

```svelte live
<script>
    import { Plot, Line } from '$lib';

    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot testid="axis">
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

```svelte
<Plot>
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

[fork](https://svelte.dev/playground/a3203dccac324843adb69022bf8ebb36?version=5.28.1)

You can turn the implicit axes off by adding `axis: false`

```svelte live
<script>
    import { Plot, Line } from '$lib';

    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot axes={false}>
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

```svelte
<Plot axes={false}>
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

[fork](https://svelte.dev/playground/90670fa63bac442b93f68ddb9cdee63a?version=5.28.1)

You can also control the implicit axes individually using the x and y options. Here we're forcing the x axis to be displayed on both sides of the plot and we're disabling the implicit y axis:

```svelte live
<script>
    import { Plot, Line } from '$lib';
    import { page } from '$app/state';
    const { aapl } = $derived(page.data.data);
</script>

<Plot x={{ axis: false }} y={{ axis: 'both' }}>
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

```svelte
<Plot x={{ axis: false }} y={{ axis: 'both' }}>
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

[fork](https://svelte.dev/playground/607be633a22c48989c683ebda5b8f740?version=5.28.1)

## Implicit axis options

When using implicit axes (the default), you can customize them via the `x` and `y` scale options:

- `axis` - controls which sides of the plot have axes
    - For x-axis: 'top', 'bottom', 'both', or false
    - For y-axis: 'left', 'right', 'both', or false
- `tickSpacing` - spacing between ticks in pixels
- `tickFormat` - format for tick labels (can be 'auto', format string, or custom function)
- `tickRotate` - rotation angle for tick labels in degrees
- `label` - the axis label
- `labelAnchor` - position of axis labels
    - For x-axis: 'auto', 'left', 'center', 'right'
    - For y-axis: 'auto', 'bottom', 'middle', 'top'
- `interval` - the interval to select axis ticks from, either numeric or a string like '2 weeks')
- `insetLeft/Right` - insets for x-axis positioning
- `insetTop/Bottom` - insets for y-axis positioning

A combination of options:

```svelte live
<script>
    import { Plot, Line } from '$lib';

    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot
    x={{
        axis: 'both'
    }}
    y={{
        axis: 'right',
        label: '',
        interval: 25,
        tickFormat: (d) => d.toFixed(2)
    }}>
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

```svelte
<Plot
    x={{
        axis: 'bottom',
        tickSpacing: 100,
        tickFormat: (d) => `$${d}`,
        tickRotate: -45
    }}
    y={{
        axis: 'both',
        tickFormat: (d) => d.toFixed(2)
    }}>
    <!-- plot content -->
</Plot>
```

## Explicit axes

If you add the `AxisX` and `AxisY` marks to your plot, SveltePlot will disable the implicit axes. This way you can use a lot more options to customize and style the axes.

```svelte live
<script>
    import { Plot, Line, AxisX, AxisY } from '$lib';

    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot>
    <AxisX tickFontSize={15} />
    <AxisY fill="red" />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

```svelte
<Plot>
    <AxisX tickFontSize={15} />
    <AxisY fill="red" />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

```svelte
<Plot
    frame
    x={{ domain: [0, 10] }}
    y={{ domain: [0, 5] }}
    marginBottom={40}
    marginRight={30}>
    <AxisX anchor="top" tickSize={10} tickFontSize="14px" />
    <AxisX stroke="cornflowerblue" fill="cornflowerblue" />
    <AxisY
        fill="green"
        anchor="right"
        tickSize={-5}
        tickPadding={10} />
    <AxisY
        stroke="magenta"
        fill="#dd0000"
        ticks={[0, 1.5, 2, 2.5, 4, 5]} />
</Plot>
```

The automatic ticks can be customized using the <b>tickSpacing</b> option:

```svelte
<Plot
    x={{ tickSpacing: 150 }}
    y={{ tickSpacing: 10 }}
    testid="tickspacing">
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

Ordinal axis:

```svelte live
<script>
    import { Plot, RuleY } from '$lib';
</script>

<Plot
    x={{
        domain: 'These are some ordinal ticks on a band scale'.split(
            ' '
        )
    }} />
```

```svelte
<Plot
    x={{
        domain: 'These are some ordinal ticks on a band scale'.split(
            ' '
        )
    }} />
```

You can change the defaults for SveltePlot grids by defining the `svelteplot/defaults` context:

```svelte live
<script>
    import { Plot, Line } from '$lib';

    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot grid testid="axis">
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

```svelte
<script>
    import { Plot, Line } from 'svelteplot';
    import { setContext } from 'svelte';

    setContext('svelteplot/defaults', {
        tickSize: 0
    });

    let aapl = [
        /* import data etc. */
    ];
</script>

<Plot grid testid="axis">
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

## AxisX

You can explicitly add an x axis using the `AxisX` mark component. The `AxisX` component provides more customization options than the implicit axes.

**Options**

- `data` - array of custom tick values (if not provided, ticks are generated automatically)
- `title` - axis title (overrides any automatic title)
- `anchor` - position of the axis, either 'top' or 'bottom'
- `facetAnchor` - controls axis placement in faceted plots ('auto', 'top-empty', 'bottom-empty', 'top', 'bottom')
- `labelAnchor` - controls title label alignment ('auto', 'left', 'center', 'right')
- `interval` - interval between ticks (works with time scales, can be 'day', 'month', 'year', 'quarter', etc.)
- `tickSize` - size of the tick marks in pixels (default: 6)
- `tickFontSize` - font size for tick labels (default: 11)
- `tickPadding` - padding between tick lines and labels (default: 3)
- `tickFormat` - custom formatter for tick labels (can be 'auto', Intl.DateTimeFormatOptions, Intl.NumberFormatOptions, or custom function)
- `tickClass` - function to assign custom classes to ticks based on their values
- `automatic` - internal flag, set to true for implicit axes

The `AxisX` component also inherits all styling properties from the base mark component (fill, stroke, strokeWidth, opacity, etc.).

## AxisY

The `AxisY` component provides extensive customization options for y-axis presentation.

**Options**

- `data` - array of custom tick values (if not provided, ticks are generated automatically)
- `title` - axis title (overrides any automatic title)
- `anchor` - position of the axis, either 'left' or 'right'
- `facetAnchor` - controls axis placement in faceted plots ('auto', 'left-empty', 'right-empty', 'left', 'right')
- `lineAnchor` - vertical alignment of tick text ('top', 'center', 'bottom')
- `tickSize` - size of the tick marks in pixels (default: 6)
- `tickFontSize` - font size for tick labels (default: 11)
- `tickPadding` - padding between tick lines and labels (default: 3)
- `tickFormat` - custom formatter for tick labels (can be 'auto', Intl.DateTimeFormatOptions, Intl.NumberFormatOptions, or custom function)
- `tickClass` - function to assign custom classes to ticks based on their values
- `automatic` - internal flag, set to true for implicit axes

The `AxisY` component also inherits all styling properties from the base mark component (fill, stroke, strokeWidth, opacity, etc.).

## Advanced use

### Customizing axis ticks

You can customize the automatic axis ticks using the `interval` and `tickSpacing` options. For numeric scales interval

```svelte live
<script>
    import { Plot } from '$lib';
    import { Slider } from '$lib/ui';

    let interval = $state(15);
</script>

<Slider
    bind:value={interval}
    min={5}
    max={50}
    label="Interval" />
<Plot x={{ domain: [0, 101], interval }} />
```

```svelte
<Plot x={{ domain: [0, 101], interval: 15 }} />
```

[fork](https://svelte.dev/playground/9cb92cbfa837428686a7f4bc990b74f9?version=5.28.1)

For time-scales you can define the interval as string:

```svelte live
<script>
    import { Plot } from '$lib';
    import { Select } from '$lib/ui';

    let interval = $state('3 months');
</script>

<Select
    label="Interval"
    bind:value={interval}
    options={[
        '2 weeks',
        '4 weeks',
        '1 month',
        '2 months',
        '3 months'
    ]} />
<Plot
    x={{
        domain: [
            new Date(2024, 0, 1),
            new Date(2025, 0, 1)
        ],
        interval
    }} />
```

```svelte
<Plot
    x={{
        domain: [
            new Date(2024, 0, 1),
            new Date(2025, 0, 1)
        ],
        interval: '3 months'
    }} />
```

Another way to customize the number of ticks shown is to set the **tickSpacing** option. Higher tick spacing means fewer ticks.

```svelte live
<script>
    import { Plot } from '$lib';
    import { Slider } from '$lib/ui';

    let tickSpacing = $state(30);
</script>

<Slider
    bind:value={tickSpacing}
    min={10}
    max={100}
    label="tickSpacing" />
<Plot x={{ domain: [0, 101], tickSpacing }} />
```

```svelte
<Plot x={{ domain: [0, 101], tickSpacing: 30 }} />
```

[fork](https://svelte.dev/playground/6ccccb750ac84912bda3ac498c28e8b3?version=5.28.1)

You can also define the ticks manually:

```svelte live
<script>
    import { Plot } from '$lib';
    import { Slider } from '$lib/ui';
</script>

<Plot
    x={{
        domain: [0, 101],
        ticks: [0, 10, 25, 50, 90, 100]
    }} />
```

```svelte
<Plot
    x={{
        domain: [0, 101],
        ticks: [0, 10, 25, 50, 90, 100]
    }} />
```

:::info
Note that customizing ticks via the `x` or `y` scale options will also affect the implicit [grids](/marks/grid).
:::

### Ticks inside the plot

To render y axis ticks inside the plot you need to use the explicit axis mark which lets you control `tickSize` and `tickPadding` as well as the vertical offset `dy`. Note that you likely need to adjust the horizontal inset to make sure the ticks don't overlap with your data marks.

```svelte live
<script>
    import { Plot, Line, AxisY } from '$lib';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot grid x={{ insetLeft: 20 }}>
    <AxisY
        tickSize={0}
        tickPadding={0}
        dy={-5}
        lineAnchor="bottom"
        textAnchor="start" />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

```svelte
<Plot grid x={{ insetLeft: 20 }}>
    <AxisY
        tickSize={0}
        tickPadding={0}
        dy={-5}
        lineAnchor="bottom"
        textAnchor="start" />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

### Styling ticks by value

You can assign custom class to ticks based on the tick value by passing a `tickClass` function

```svelte live
<script>
    import { Plot, AxisX } from '$lib';
</script>

<Plot
    marginBottom={50}
    x={{
        domain: [-30, 60]
    }}>
    <AxisX
        tickClass={(d) =>
            d < 0 ? 'negative' : d > 0 ? 'positive' : ''} />
</Plot>

<style>
    :global(.tick.negative text) {
        fill: var(--svp-red) !important;
    }
    :global(.tick.positive text) {
        fill: var(--svp-blue) !important;
    }
</style>
```

```svelte
<Plot x={{ domain: [-30, 60] }}>
    <AxisX
        tickClass={(d) =>
            d < 0 ? 'negative' : d > 0 ? 'positive' : ''} />
</Plot>

<style>
    :global(.tick.negative text) {
        fill: red !important;
    }
    :global(.tick.positive text) {
        fill: blue !important;
    }
</style>
```

[fork](https://svelte.dev/playground/f94f7dbe5c2842d28e3a3e87666663bd?version=5.28.1)

### Two layers of ticks

You can use two explicit axes to create multiple layers of ticks. The yearly ticks are moved down using the `tickPadding` option. We're setting `tickSize` to 0 to avoid drawing another set of tick lines:

```svelte live
<script>
    import { Plot, AxisX } from '$lib';
</script>

<Plot
    margins={10}
    marginBottom={40}
    x={{
        domain: [new Date(2022, 0, 1), new Date(2024, 1, 1)]
    }}>
    <AxisX
        interval="quarter"
        tickFormat={(d) => `Q${d.getMonth() / 3 + 1}`} />
    <AxisX
        interval="year"
        tickSize={0}
        tickFontSize={15}
        tickPadding={25}
        tickFormat="YYYY"
        fill="#999" />
</Plot>
```

```svelte
<Plot
    margins={30}
    marginBottom={50}
    x={{
        domain: [new Date(2022, 0, 1), new Date(2024, 1, 1)]
    }}>
    <AxisX
        interval="quarter"
        tickFormat={(d) => `Q${d.getMonth() / 3 + 1}`} />
    <AxisX
        interval="year"
        tickSize={0}
        tickFontSize={15}
        tickPadding={25}
        tickFormat="YYYY"
        fill="#999" />
</Plot>
```

[fork](https://svelte.dev/playground/abb8f5bfa45b416db9aa7ddac833d1e3?version=5.28.2)

Note that you can achieve a similar axis using a custom tick format function that returns an array. Repeating tick text lines are being omitted automatically:

```svelte live
<script>
    import { Plot, AxisX } from '$lib';
</script>

<Plot
    marginLeft={30}
    x={{
        domain: [
            new Date(2022, 0, 1),
            new Date(2024, 1, 1)
        ],
        tickFormat: (d) => [
            `Q${d.getMonth() / 3 + 1}`,
            d.getFullYear()
        ]
    }}>
</Plot>
```

```svelte
<Plot
    x={{
        domain: [
            new Date(2022, 0, 1),
            new Date(2024, 1, 1)
        ],
        tickFormat: (d) => [
            `Q${d.getMonth() / 3 + 1}`,
            d.getFullYear()
        ]
    }}>
</Plot>
```

[fork](https://svelte.dev/playground/52b5047e28014118921ce753c8c601a7?version=5.28.1)

### Rotated ticks

You can rotate tick labels using `tickRotate`:

:::warning
Keep in mind that rotated texts are a lot harder to read, so if possible, avoid rotated axis ticks (e.g. by flipping a column chart to bar chart) or at least limit rotation to 45 degrees.
:::

```svelte live
<script>
    import { Plot, RuleY } from '$lib';
    import { Slider } from '$lib/ui';

    let tickRotate = $state(-45);
</script>

<Slider
    label="tick angle"
    min={-90}
    max={90}
    step={5}
    bind:value={tickRotate} />
<Plot
    marginBottom={50}
    x={{
        tickRotate,
        domain: 'These are some ordinal ticks on a band scale'.split(
            ' '
        )
    }} />
```

```svelte
<Plot
    x={{
        tickRotate: -45,
        domain: 'These are some ordinal ticks on a band scale'.split(
            ' '
        )
    }} />
```
