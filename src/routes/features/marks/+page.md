---
title: Marks
---

Marks are the fundamental building blocks of visualizations in SveltePlot. Each mark represents a specific way to visually encode data, from simple elements like dots and lines to more complex representations like areas and bars.

## What are Marks?

In SveltePlot, marks are the visible layers of a visualization. They are the visual elements that represent your data on the screen. A complete visualization is typically composed of multiple marks working together, each handling a specific aspect of the visual representation.

For example, a typical line chart might include:

- A `Line` mark for the data line
- `AxisX` and `AxisY` marks for the axes
- `GridX` and `GridY` marks for the background grid
- `Dot` marks for highlighting specific data points
- A `Frame` mark to contain everything

Each mark is a Svelte component that handles its own rendering based on the provided data and settings.

All marks in SveltePlot share several common characteristics:

## Data Binding

Every mark can be bound to data through the `data` prop:

```svelte
<Line data={myDataset} x="date" y="value" />
```

## Channel Mapping

Marks define how data attributes map to visual channels (like position, color, size) through channel props:

- Position channels: `x`, `y`, `x1`, `x2`, `y1`, `y2`, etc.
- Appearance channels: `fill`, `stroke`, `opacity`, etc.
- Size/scaling channels: `r`, `size`, `strokeWidth`, etc.

## Auto-Scaling

Marks automatically inform the scale calculations of the parent Plot component. In the following example, the y scale domain will automatically cover the range of both mark datasets:

```svelte
<Plot>
    <Line data={dataset1} x="date" y="sales" />
    <Dot data={dataset2} x="date" y="revenue" />
</Plot>
```

## Styling

Marks can be styled using both SVG attributes and CSS classes:

```svelte
<Line
    {data}
    x="date"
    y="value"
    stroke="steelblue"
    strokeWidth={2}
    class="highlight-line" />
```

Styles can also be defined as function, even for non-scaled attributes like

```svelte live
<script>
    import { Plot, Line } from '$lib';

    // Sample data
    const data = [
        { x: 0, y: 0, projection: false },
        { x: 1, y: 2.5, projection: false },
        { x: 2, y: 1, projection: false },
        { x: 3, y: 4, projection: false },
        { x: 4, y: 2, projection: false },
        { x: 4, y: 2, projection: true },
        { x: 5, y: 5, projection: true }
    ];
</script>

<Plot height={250} grid>
    <Line
        {data}
        x="x"
        y="y"
        stroke="projection"
        strokeWidth={2.5}
        strokeDasharray={(d) =>
            d.projection ? '5,5' : ''} />
</Plot>
```

```svelte
<Plot grid>
    <Line
        {data}
        x="date"
        y="value"
        stroke="projection"
        strokeDasharray={(d) =>
            d.projection ? '5,5' : ''} />
</Plot>
```

[fork](https://svelte.dev/playground/0d11ad8b8fbd49a1a2a3a7d8f85a47dc?version=5.28.2)

By default mark styles are applied as inline styles to the respective DOM elements. This can make it harder to apply styles from "outside" using global CSS selectors, since you need `!important` to [override inline styles](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Specificity#inline_styles). SveltePlot offers a convenient way around this problem: if you pass an instance to the `css` function from `@emotion/css`, the styles will be applied via class instead of inline styles.

Compare the DOM of the example below:

```svelte live
<script>
    import { Plot, Line } from '$lib';
    import { css } from '@emotion/css';

    // Sample data
    const data = [
        { x: 0, y: 0, projection: false },
        { x: 1, y: 2.5, projection: false },
        { x: 2, y: 1, projection: false },
        { x: 3, y: 4, projection: false },
        { x: 4, y: 2, projection: false },
        { x: 4, y: 2, projection: true },
        { x: 5, y: 5, projection: true }
    ];
</script>

<Plot height={250} grid {css}>
    <Line
        {data}
        x="x"
        y="y"
        stroke="projection"
        strokeWidth={2.5}
        strokeDasharray={(d) =>
            d.projection ? '5,5' : ''} />
</Plot>
```

```svelte
<script>
    import { css } from '@emotion/css';
    const data = [...];
</script>

<Plot height={250} grid {css}>
    <Line
        {data}
        x="x"
        y="y"
        stroke="projection"
        strokeDasharray={(d) =>
            d.projection ? '5,5' : ''} />
</Plot>
```

[fork](https://svelte.dev/playground/d72f3c91050c4397a179d884a564cfa5?version=5.28.2)

## Event Handling

Marks support interactive events that can be hooked into:

```svelte live
<script>
    import { Plot, Dot, AxisX, AxisY } from '$lib';

    // Sample data
    const data = [
        { x: 1, y: 1, size: 5, category: 'A' },
        { x: 2, y: 3, size: 10, category: 'B' },
        { x: 3.5, y: 4, size: 9, category: 'A' },
        { x: 3, y: 2, size: 8, category: 'A' },
        { x: 4, y: 5, size: 12, category: 'C' },
        { x: 5, y: 4, size: 15, category: 'B' }
    ];

    function handleClick(e, d) {
        console.log(e, d);
    }
</script>

<Plot
    height={80}
    r={{ range: [0, 20] }}
    y={{ grid: true }}
    inset={30}>
    <Dot
        {data}
        y={0}
        x="x"
        r="size"
        fill="category"
        onclick={handleClick} />
</Plot>
```

```svelte
<Dot data={points} x="x" y="y" onclick={handleClick} />
```

## Faceting

All marks support [faceting](/features/faceting) for creating small multiples:

```svelte
<Plot>
    <Line x="date" y="value" fx="category" />
</Plot>
```

## Available Marks

SveltePlot provides a comprehensive collection of marks for various visualization needs:

### Basic Marks

- [Arrow](/marks/arrow) - For drawing arrows and vectors
- [Dot](/marks/dot) - For scatter plots and point-based visualizations
- [Line](/marks/line) - For line charts and trend visualizations
- [Text](/marks/text) - For adding text labels to visualizations
- [Rect](/marks/rect) - For drawing rectangular shapes

### Area Marks

- [Area](/marks/area) - For general area visualization with explicit x1, y1, x2, y2
- [AreaX](/marks/area) - For vertical area charts
- [AreaY](/marks/area) - For horizontal area charts

### Bar Marks

- [BarX](/marks/bar) - For horizontal bar charts
- [BarY](/marks/bar) - For vertical bar charts

### Distribution Marks

- [BoxX](/marks/box) - For horizontal box plots
- [BoxY](/marks/box) - For vertical box plots

### Statistical Marks

- [RegressionX](/marks/regression) - For horizontal regression lines
- [RegressionY](/marks/regression) - For vertical regression lines
- [BollingerX](/marks/bollinger) - For horizontal Bollinger bands
- [BollingerY](/marks/bollinger) - For vertical Bollinger bands

### Cell Marks

- [Cell](/marks/cell) - For heatmaps with band scales
- [CellX](/marks/cell) - Cell variant with band scale on x-axis
- [CellY](/marks/cell) - Cell variant with band scale on y-axis

### Axes and Guides

- [AxisX](/marks/axis) - For x-axis display
- [AxisY](/marks/axis) - For y-axis display
- [GridX](/marks/grid) - For vertical grid lines
- [GridY](/marks/grid) - For horizontal grid lines
- [RuleX](/marks/rule) - For vertical reference lines
- [RuleY](/marks/rule) - For horizontal reference lines
- [TickX](/marks/tick) - For x-axis tick marks
- [TickY](/marks/tick) - For y-axis tick marks
- [Frame](/marks/frame) - For creating a frame around the visualization

### Specialized Marks

- [Spike](/marks/spike) - For creating spike or stem charts
- [DifferenceY](/marks/difference) - For showing differences between lines
- [Link](/marks/link) - For creating connections between points
- [Vector](/marks/vector) - For displaying vector data

### Geographic Marks

- [Geo](/marks/geo) - For geographic data visualization
- [Graticule](/marks/graticule) - For geographic grid lines
- [Sphere](/marks/sphere) - For geographic background sphere

### Interaction and UI Marks

- [HTMLTooltip](/marks/tooltip) - For enhanced HTML tooltips
- [ColorLegend](/marks/color-legend) - For color scale legends
- [SymbolLegend](/marks/symbol-legend) - For symbol legends
- [Pointer](/marks/pointer) - For interactive pointers

### Custom Marks

- [CustomMark](/marks/custom) - For creating custom SVG-based marks
- [CustomMarkHTML](/marks/custom) - For creating custom HTML-based marks like annotations
