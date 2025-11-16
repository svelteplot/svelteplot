---
title: Default options
---

SveltePlot defines internal defaults for a lot of its options so you don't have to worry about them in your day-to-day use. However, sometimes you may want to divert from these defaults for _all_ of the plots on your page.

In this case, you can make use of the `setPlotDefaults` hook.

If you're using SveltePlot in a SvelteKit project, you can even set the defaults in your root layout to ensure the same defaults are being used in your entire site.

```svelte title="+layout.svelte"
<script>
    import { setPlotDefaults } from 'svelteplot';

    setPlotDefaults({
        height: 400,
        colorScheme: 'plasma',
        axis: {
            tickSize: 0,
            tickPadding: 5
        }
    });
</script>

<slot />
```

## Global defaults

The `setPlotDefaults` hook accepts the following options:

| Name                     | Description                                                                                                                                                            | Unit   | Default                                         |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------- |
| _height_                 | Plot height                                                                                                                                                            | px     | `350`                                           |
| _inset_                  | Plot inset                                                                                                                                                             | px     | `0`                                             |
| _colorScheme_            | Default scheme for color scale                                                                                                                                         | string | `'turbo'`                                       |
| _categoricalColorScheme_ | Default scheme for [categorical color scales](/features/color-scales#Categorical-colors)                                                                               | string | `'observable10'`                                |
| _unknown_                | Fallback color to be used when mapping NAs to colors                                                                                                                   | string | `'#cccccc'`                                     |
| _locale_                 | Default locale used in axis ticks etc.                                                                                                                                 | string | `'en-US'`                                       |
| _numberFormat_           | Default [number format options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options) in axis ticks | object | `{ style: 'decimal', compactDisplay: 'short' }` |
| _css_                    | For passing an `@emotion/css` instance to your plots                                                                                                                   |        |                                                 |
| _sortOrdinalDomains_     | Whether to sort ordinal positional domains alphabetically                                                                                                              | bool   | `true`                                          |

## Mark-specific defaults

Since version 0.3 you can set defaults for specific components using their respective keys:

| Component | Key         | Description                                |
| --------- | ----------- | ------------------------------------------ |
| Axis      | `axis`      | Default options for both X and Y axes      |
| AxisX     | `axisX`     | Default options for X axis                 |
| AxisY     | `axisY`     | Default options for Y axis                 |
| Grid      | `grid`      | Default options for both X and Y grids     |
| GridX     | `gridX`     | Default options for X grid                 |
| GridY     | `gridY`     | Default options for Y grid                 |
| Frame     | `frame`     | Default options for plot frame             |
| Area      | `area`      | Default options for area marks             |
| AreaX     | `areaX`     | Default options for horizontal area marks  |
| AreaY     | `areaY`     | Default options for vertical area marks    |
| Bar       | `bar`       | Default options for bar marks              |
| BarX      | `barX`      | Default options for horizontal bar marks   |
| BarY      | `barY`      | Default options for vertical bar marks     |
| Box       | `box`       | Default options for box marks              |
| BoxX      | `boxX`      | Default options for horizontal box marks   |
| BoxY      | `boxY`      | Default options for vertical box marks     |
| Brush     | `brush`     | Default options for brush marks            |
| BrushX    | `brushX`    | Default options for horizontal brush marks |
| BrushY    | `brushY`    | Default options for vertical brush marks   |
| Cell      | `cell`      | Default options for cell marks             |
| Dot       | `dot`       | Default options for dot marks              |
| Geo       | `geo`       | Default options for geo marks              |
| Graticule | `graticule` | Default options for graticule marks        |
| Line      | `line`      | Default options for line marks             |
| Link      | `link`      | Default options for link marks             |
| Pointer   | `pointer`   | Default options for pointer marks          |
| Rect      | `rect`      | Default options for rect marks             |
| RectX     | `rectX`     | Default options for horizontal rect marks  |
| RectY     | `rectY`     | Default options for vertical rect marks    |
| Rule      | `rule`      | Default options for rule marks             |
| RuleX     | `ruleX`     | Default options for horizontal rule marks  |
| RuleY     | `ruleY`     | Default options for vertical rule marks    |
| Sphere    | `sphere`    | Default options for sphere marks           |
| Spike     | `spike`     | Default options for spike marks            |
| Text      | `text`      | Default options for text marks             |
| Tick      | `tick`      | Default options for tick marks             |
| TickX     | `tickX`     | Default options for horizontal tick marks  |
| TickY     | `tickY`     | Default options for vertical tick marks    |
| Vector    | `vector`    | Default options for vector marks           |

## CSS Variables

SveltePlot is also relying on CSS variables.

| Name              | Description                   | Unit  | Default |
| ----------------- | ----------------------------- | ----- | ------- |
| _--svelteplot-bg_ | Background color of your page | color | white   |

## Examples

Setting Global and Component Defaults

```svelte live
<script>
    import { Plot, Dot, setPlotDefaults } from 'svelteplot';
    import { page } from '$app/state';

    let { penguins } = $derived(page.data.data);

    setPlotDefaults({
        // Global defaults
        inset: 15,
        categoricalColorScheme: [
            'var(--svp-red)',
            'var(--svp-blue)',
            'var(--svp-green)'
        ],
        // Component-specific defaults
        axis: {
            tickSize: 0,
            tickPadding: 5
        },
        frame: { implicit: true },
        grid: { implicit: true },
        dot: {
            r: 5
        }
    });
</script>

<Plot>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        fx="species"
        y="culmen_depth_mm"
        fill="species" />
</Plot>
```

```js
import { setPlotDefaults } from 'svelteplot';

setPlotDefaults({
    // Global defaults
    inset: 15,
    categoricalColorScheme: [
        'var(--svp-red)',
        'var(--svp-blue)',
        'var(--svp-green)'
    ],
    // Mark-specific defaults
    axis: {
        tickSize: 0,
        tickPadding: 5
    },
    frame: { implicit: true },
    grid: { implicit: true },
    dot: {
        r: 5
    }
});
```

another one

```svelte live
<script>
    import {
        Plot,
        BarX,
        AreaY,
        setPlotDefaults
    } from 'svelteplot';
    import { page } from '$app/state';

    let { penguins } = $derived(page.data.data);
    setPlotDefaults({
        bar: {
            borderRadius: 4,
            stroke: 'currentColor',
            fill: null
        },
        area: {
            curve: 'basis',
            fillOpacity: 0.5
        }
    });
</script>

<div style="columns:2">
    <Plot height={300}>
        <BarX data={[1, 2, 3, 4, 5, 6]} />
    </Plot>
    <Plot height={300}>
        <AreaY data={[1, 3, 2, 4, 6, 5]} />
    </Plot>
</div>
```

```js
import { setPlotDefaults } from 'svelteplot';

setPlotDefaults({
    bar: {
        borderRadius: 4,
        stroke: 'currentColor',
        fill: null
    },
    area: {
        curve: 'basis',
        fillOpacity: 0.5
    }
});
```

[fork](https://svelte.dev/playground/e3d2f66c442245ab9b7922b5d79b0b00?version=5)
