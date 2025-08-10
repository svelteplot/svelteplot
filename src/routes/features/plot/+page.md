---
title: Plot
---

The <b>Plot</b> component is the base for each plot. It takes care of managing the shared [scales](/features/scales), computes smart default options and implicitly creates axis, grid, frame, and legend marks.

In the following example, you can see that the `<Plot>` component has added axes, grids, and a frame for us, so we don't have to add them to our plots every time we need them.

```svelte live
<script>
    import { Plot, Line } from 'svelteplot';
    import { page } from '$app/state';
    const { aapl } = $derived(page.data.data);
</script>

<Plot grid frame testid="aapl-line-frame">
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

```svelte
<script>
    import { Plot, Line } from 'svelteplot';
    import aapl from './aapl.csv';
</script>

<Plot grid frame>
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

[fork](https://svelte.dev/playground/8d65004eee1e4375b8b45b92e69f26cd?version=5)

:::info
The implicit axes are added by default.
:::

But if we wanted to, we can add these marks individually, and it would look just the same. Using the explicit marks gives us more control over styling and the rendering order.

```svelte live
<script>
    import {
        Plot,
        Frame,
        GridX,
        GridY,
        AxisX,
        AxisY,
        Line
    } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot testid="aapl-line-frame">
    <Frame />
    <GridX />
    <GridY />
    <AxisX />
    <AxisY />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

```svelte
<script>
    import {
        Plot,
        Frame,
        GridX,
        GridY,
        AxisX,
        AxisY,
        Line
    } from 'svelteplot';
    import aapl from './aapl.csv';
</script>

<Plot>
    <Frame />
    <GridX />
    <GridY />
    <AxisX />
    <AxisY />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

[fork](https://svelte.dev/playground/c447b344808943deb11522956e481222?version=5)

This can be useful if you want to customize the styling of the frame or grids, for instance. So you can style plots to look like [ggplot2](https://ggplot2.tidyverse.org/)'s default theme:

```svelte live
<script>
    import {
        Plot,
        Line,
        GridX,
        GridY,
        Frame
    } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot inset={10} testid="ggplot">
    <Frame fill="#eaeaea" />
    <GridX stroke="#fff" strokeOpacity="1" />
    <GridY stroke="#fff" strokeOpacity="1" />
    <Line data={aapl} x="Date" y="Close" stroke="#222" />
</Plot>
```

```svelte
<Plot inset={10}>
    <Frame fill="#eaeaea" />
    <GridX stroke="#fff" strokeOpacity="1" />
    <GridY stroke="#fff" strokeOpacity="1" />
    <Line data={aapl} x="Date" y="Close" stroke="#222" />
</Plot>
```

[fork](https://svelte.dev/playground/1147c6b7fc4347cdb894df3b6a893125?version=5)

For convenience, you can pass **title**, **subtitle**, and **caption** to the Plot component and it will create headings and a figure caption for you:

```svelte live
<script>
    import { Plot, Line, Frame } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot
    grid
    title="This is a plot title"
    subtitle="This is a subtitle"
    caption="This is the caption"
    testid="with-title">
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

```svelte
<Plot grid
    title="This is a plot title"
    subtitle="This is a subtitle"
    caption="This is the caption"">
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

By default, the Plot element will fill 100% of it's parent container width, but you can set a custom **maxWidth**, too:

```svelte live
<script>
    import { Plot, Line } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot grid maxWidth="300px">
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

```svelte
<Plot grid maxWidth="300px">
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

## Plot options

List of all plot options you can pass via props on the `<Plot />` component:

- `class` - set a HTML class to be added to the `<figure>` element. Useful for applying additional CSS styling.
- `title` - a title to be displayed as `<h2>` element above the plot
- `subtitle` - a subtitle to be displayed as `<h3>` element above the plot
- `caption` - a caption to be displayed as `<figcaption>` below the plot
- `locale` - locale to be used for number and date formatting, e.g. in axis ticks

**Size and margins**

- `maxWidth` - you can set the max-width of the plot element to prevent the plot from scaling to the container div width
- `height`
- `marginTop` - plot margins
- `marginBottom` - margins
- `marginLeft` - margins
- `marginRight` - margins
- `margin` - shortcut to set all 4 margins to the same value
- `inset` - shortcut for setting all insets. To set individual insets, see `x` and `y` scale options.

**Implicit marks**

- `grid` - set this flag to activate implicit grids
- `axes` - set this flag to activate implicit axes
- `frame` - set this flag to activate implicit frame

**Scale options**

- `x` - options for the x scale:
    - `axis`
    - `insetLeft`
    - `insetRight`
    - `ticks`
    - `tickFormat`
- `y` - options for the y scale
- `r` - options for the radius scale
- `color` - options for the color scale
- `opacity` - options for the opacity scale
- `symbol` - options for the symbol scale
- `length` - options for the length scale

- You can set the following shared scale options for all the scales listed above:
    - `domain` - custom domain for the scale
    - `range` - custom range for the scale
    - `reverse` - reverse the scale direction
    - `type` - override automatic scale type detection
    - `padding` - padding for band and point scales
    - `align` - alignment for band and point scales
    - `clamp` - whether to clamp values outside the domain
    - `nice` - whether to extend the domain to nice round values
    - `zero` - whether to include zero in the domain
    - `round` - whether to round output values
    - `percent` - whether to format values as percentages
    - `transform` - a function to transform values
    - `ticks` - custom tick values
    - `tickSpacing` - spacing between ticks
    - `tickFormat` - custom formatter for tick labels

**Scale-specific options**

- `x` also supports:
    - `grid` - whether to show a grid
    - `axis` - axis position ('top', 'bottom', 'both', or false)
    - `tickRotate` - rotation angle for tick labels
    - `labelAnchor` - position of axis label ('auto', 'left', 'center', 'right')
    - `insetLeft` - left inset value
    - `insetRight` - right inset value

- `y` also supports:
    - `grid` - whether to show a grid
    - `axis` - axis position ('left', 'right', 'both', or false)
    - `tickRotate` - rotation angle for tick labels
    - `labelAnchor` - position of axis label ('auto', 'bottom', 'middle', 'top')
    - `insetTop` - top inset value
    - `insetBottom` - bottom inset value

- `color` also supports:
    - `legend` - whether to show a color legend
    - `scheme` - color scheme name
    - `unknown` - fallback color for null/undefined values
    - `pivot` - center value for diverging scales
    - `n` - number of colors for quantize/quantile scales
- `symbol` also supports:
    - `legend` - whether to show a symbol legend

**Other plot options**

- `locale` - locale used for automatic number and date formatting in axis ticks
- `aspectRatio` - if set, computes height such that a variation in x of one unit corresponds to the given number of pixels as a variation in y of one unit
- `padding` - convenience shortcut for setting both x and y scale paddings
- `projection` - geo-projection type when using geographic data
- `testid` - adds a data-testid attribute to the plot container for testing
- `implicitScales` - if true, uses implicit scales for automated behavior
- `css` - custom CSS styling function
- `facet` - top-level faceting options:
    - `data` - data to facet by
    - `x` - accessor for horizontal facets
    - `y` - accessor for vertical facets

**Snippet options**

These can be used to add custom markup to different parts of the plot:

- `children` - content inside the SVG element (default slot)
- `header` - custom HTML before the plot body
- `footer` - custom HTML after the plot body
- `overlay` - custom HTML floating in front of the plot body
- `underlay` - custom HTML behind the plot body
- `facetAxes` - custom axes for facets

## Snippets

The Plot component provides 4 entry points for snippets for adding custom markup to the plot.

- **children** - any component used as child of the Plot component will be inserted into the `svg` element inside the plot body.
- **header** - HTML div container rendered before the plot body, useful for adding a custom headline or HTML legend marks
- **footer** - HTML div container rendered after the plot body, useful for customizing the footer or showing a legend below the plot
- **overlay** - HTML div container floating in front of the plot body, useful for HTML tooltips or for positioning a legend inside the plot area
- **underlay** - similar to the overlay container, but rendered behind the plot body. Useful for background images or things like watermarks (like in [this example](/guide/differences-to-plot#Custom-HTML))

For more flexibility, you can also use the <code>header</code> and <code>footer</code> snippet/slots
to render custom elements inside the figure element above and below the plot. This also allows you
to add events and scoped styles.

```svelte live
<script>
    import { Plot, Line, Frame } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot grid>
    {#snippet header()}
        <figcaption>
            Custom caption above the plot
        </figcaption>
    {/snippet}
    {#snippet footer()}
        <h4>
            Centered headline below plot with
            <a href="#/" onclick={() => alert('works')}
                >custom link</a>
        </h4>
    {/snippet}
    <Line data={aapl} x="Date" y="Close" />
</Plot>

<style>
    h4 {
        margin-top: 0;
        text-align: center;
        font-size: 1.15rem;
    }
    h4 a {
        color: magenta;
        text-decoration: underline;
    }
</style>
```

## Core plot

SveltePlot provides a lot of convenience features with the unfortunate side-effect of blowing up the bundle size a bit. In situations where this is a concern, you may use a more light-weight version of the Plot component. Note that you need to explicitly include all marks that you want, such as grids or axis marks.

```svelte live
<script>
    import Plot from '$lib/core/Plot.svelte';
    import { Line } from 'svelteplot';
    import { page } from '$app/state';
    const { aapl } = $derived(page.data.data);

    // custom x and y scale
    function scaleX({ domain, plotWidth, plotOptions }) {
        const { marginLeft, marginRight } = plotOptions;
        const range = [
            marginLeft,
            plotWidth - marginLeft - marginRight
        ];
        const fn = (v) =>
            ((v - domain[0]) / (domain[1] - domain[0])) *
                (range[1] - range[0]) +
            range[0];
        fn.range = () => range;
        return fn;
    }
    function scaleY({ domain, plotHeight, plotOptions }) {
        const { marginTop, marginBottom } = plotOptions;
        const range = [
            plotHeight - marginTop - marginBottom,
            marginBottom
        ];
        const fn = (v) =>
            ((v - domain[0]) / (domain[1] - domain[0])) *
                (range[1] - range[0]) +
            range[0];
        fn.range = () => range;
        return fn;
    }
</script>

<Plot x={{ scale: scaleX }} y={{ scale: scaleY }}>
    <Line
        data={aapl}
        x={(d) => new Date(d.Date)}
        y="Adj Close" />
</Plot>
```

```svelte
<script>
    import Plot from 'svelteplot/core/Plot.svelte';
    import { Line } from 'svelteplot';

    function scaleX({ domain, plotWidth, plotOptions }) {
        const { marginLeft, marginRight } = plotOptions;
        const range = [
            marginLeft,
            plotWidth - marginLeft - marginRight
        ];
        const fn = (v) =>
            ((v - domain[0]) / (domain[1] - domain[0])) *
                (range[1] - range[0]) +
            range[0];
        fn.range = () => range;
        return fn;
    }
    function scaleY({ domain, plotHeight, plotOptions }) {
        const { marginTop, marginBottom } = plotOptions;
        const range = [
            plotHeight - marginTop - marginBottom,
            marginBottom
        ];
        const fn = (v) =>
            ((v - domain[0]) / (domain[1] - domain[0])) *
                (range[1] - range[0]) +
            range[0];
        fn.range = () => range;
        return fn;
    }
</script>

<Plot x={{ scale: scaleX }} y={{ scale: scaleY }}>
    <Line
        data={aapl}
        x={(d) => new Date(d.Date)}
        y="Adj Close" />
</Plot>
```
