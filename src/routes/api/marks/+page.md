---
title: Marks API reference
---

<div class="inline-toc">

Jump to mark: [Area](/api/marks#Area), [AreaX](/api/marks#AreaX), [AreaY](/api/marks#AreaY), [Arrow](/api/marks#Arrow), [AxisX](/api/marks#AxisX), [AxisY](/api/marks#AxisY), [BarX](/api/marks#BarX), [BarY](/api/marks#BarY), [BollingerX](/api/marks#BollingerX), [BollingerY](/api/marks#BollingerY), [BoxX](/api/marks#BoxX), [BoxY](/api/marks#BoxY), [Brush](/api/marks#Brush), [BrushX](/api/marks#BrushX), [BrushY](/api/marks#BrushY), [Cell](/api/marks#Cell), [CellX](/api/marks#CellX), [CellY](/api/marks#CellY), [ColorLegend](/api/marks#ColorLegend), [DifferenceY](/api/marks#DifferenceY), [Dot](/api/marks#Dot), [DotX](/api/marks#DotX), [DotY](/api/marks#DotY), [Frame](/api/marks#Frame), [Geo](/api/marks#Geo), [Graticule](/api/marks#Graticule), [GridX](/api/marks#GridX), [GridY](/api/marks#GridY), [HTMLTooltip](/api/marks#HTMLTooltip), [Image](/api/marks#Image), [Line](/api/marks#Line), [LineX](/api/marks#LineX), [LineY](/api/marks#LineY), [Link](/api/marks#Link), [Pointer](/api/marks#Pointer), [Rect](/api/marks#Rect), [RectX](/api/marks#RectX), [RectY](/api/marks#RectY), [RegressionX](/api/marks#RegressionX), [RegressionY](/api/marks#RegressionY), [RuleX](/api/marks#RuleX), [RuleY](/api/marks#RuleY), [Sphere](/api/marks#Sphere), [Spike](/api/marks#Spike), [Text](/api/marks#Text), [TickX](/api/marks#TickX), [TickY](/api/marks#TickY), [Trail](/api/marks#Trail), [WaffleX](/api/marks#WaffleX), [WaffleY](/api/marks#WaffleY)

</div>

## Area

Creates an area chart with filled regions between two x-y value pairs

| Prop         | Type                                                                         | Description                                                                |
| ------------ | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `data?`      | Datum[]                                                                      | the input data array; each element becomes one point in the area           |
| `x1?`        | ChannelAccessor&lt;Datum&gt;                                                 | the starting horizontal position channel for the area baseline             |
| `x2?`        | ChannelAccessor&lt;Datum&gt;                                                 | the ending horizontal position channel for the area topline                |
| `y1?`        | ChannelAccessor&lt;Datum&gt;                                                 | the starting vertical position channel for the area baseline               |
| `y2?`        | ChannelAccessor&lt;Datum&gt;                                                 | the ending vertical position channel for the area topline                  |
| `z?`         | ChannelAccessor&lt;Datum&gt;                                                 | the series channel; data is grouped into separate areas by unique z values |
| `curve?`     | [CurveName](/api/marks#CurveName) \| CurveFactory                            | the curve interpolation method for connecting data points                  |
| `tension?`   | number                                                                       | the tension parameter for cardinal or Catmull-Rom curve interpolation      |
| `sort?`      | ConstantAccessor&lt;RawValue&gt; \| {'{'} channel: 'stroke' \| 'fill'; {'}'} | controls the order of data points before rendering                         |
| `stack?`     | Partial&lt;[StackOptions](/api/marks#StackOptions)&gt;                       | options for stacking area data values                                      |
| `canvas?`    | boolean                                                                      | if true, renders using Canvas instead of SVG                               |
| `areaClass?` | ConstantAccessor&lt;string, Datum&gt;                                        | CSS class name(s) to apply to individual area path elements                |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [LinkableMarkProps](/api/marks#LinkableMarkProps).

## AreaX

Creates a horizontal area chart with x value and baseline. Areas are implicitly stacked horizontally if just the x channel is defined.

| Prop         | Type                                                                                | Description                                                                             |
| ------------ | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `data?`      | Datum[]                                                                             | the input data array; each element becomes one point in the area                        |
| `x?`         | ChannelAccessor&lt;Datum&gt;                                                        | the horizontal position channel, implicit stacking is used to derive x1 and x2 channels |
| `x1?`        | ChannelAccessor&lt;Datum&gt;                                                        | the horizontal position channel of the lower end of bands                               |
| `x2?`        | ChannelAccessor&lt;Datum&gt;                                                        | the horizontal position channel of the upper end of bands                               |
| `y?`         | ChannelAccessor&lt;Datum&gt;                                                        | the vertical position channel                                                           |
| `z?`         | ChannelAccessor&lt;Datum&gt;                                                        | the series channel; data is grouped into separate areas by unique z values              |
| `curve?`     | [CurveName](/api/marks#CurveName) \| CurveFactory                                   | the curve interpolation method for connecting data points                               |
| `tension?`   | number                                                                              | the tension parameter for cardinal or Catmull-Rom curve interpolation                   |
| `sort?`      | ConstantAccessor&lt;RawValue, Datum&gt; \| {'{'} channel: 'stroke' \| 'fill'; {'}'} | controls the order of data points before rendering                                      |
| `stack?`     | Partial&lt;[StackOptions](/api/marks#StackOptions)&gt;                              | options for stacking area data values                                                   |
| `canvas?`    | boolean                                                                             | if true, renders using Canvas instead of SVG                                            |
| `areaClass?` | ConstantAccessor&lt;string, Datum&gt;                                               | CSS class name(s) to apply to individual area path elements                             |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [LinkableMarkProps](/api/marks#LinkableMarkProps).

## AreaY

Creates a vertical area chart with y value and baseline. Areas are implicitly stacked vertically if just the y channel is defined.

| Prop         | Type                                                                                | Description                                                                  |
| ------------ | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `data?`      | Datum[]                                                                             | the input data array; each element becomes one point in the area             |
| `x?`         | ChannelAccessor&lt;Datum&gt;                                                        | the horizontal position channel                                              |
| `y?`         | ChannelAccessor&lt;Datum&gt;                                                        | the vertical position channel. Implicit stacking is used to derive y1 and y2 |
| `y1?`        | ChannelAccessor&lt;Datum&gt;                                                        | the vertical position channel of the lower end of bands                      |
| `y2?`        | ChannelAccessor&lt;Datum&gt;                                                        | the vertical position channel of the upper end of bands                      |
| `z?`         | ChannelAccessor&lt;Datum&gt;                                                        | the series channel; data is grouped into separate areas by unique z values   |
| `curve?`     | [CurveName](/api/marks#CurveName) \| CurveFactory                                   | the curve interpolation method for connecting data points                    |
| `tension?`   | number                                                                              | the tension parameter for cardinal or Catmull-Rom curve interpolation        |
| `sort?`      | ConstantAccessor&lt;RawValue, Datum&gt; \| {'{'} channel: 'stroke' \| 'fill'; {'}'} | controls the order of data points before rendering                           |
| `stack?`     | Partial&lt;[StackOptions](/api/marks#StackOptions)&gt;                              | options for stacking area data values                                        |
| `canvas?`    | boolean                                                                             | if true, renders using Canvas instead of SVG                                 |
| `areaClass?` | ConstantAccessor&lt;string, Datum&gt;                                               | CSS class name(s) to apply to individual area path elements                  |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [LinkableMarkProps](/api/marks#LinkableMarkProps).

## Arrow

Creates arrows with customizable heads, angles, and bending

| Prop          | Type                                                                                                         | Description                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `data`        | Datum[]                                                                                                      | the input data array; each element becomes one arrow                |
| `sort?`       | ConstantAccessor&lt;RawValue&gt; \| {'{'} channel: 'stroke' \| 'fill' \| 'x1' \| 'y1' \| 'x2' \| 'y2'; {'}'} | controls the order of data before rendering                         |
| `x1`          | ChannelAccessor&lt;Datum&gt;                                                                                 | the starting horizontal position channel                            |
| `y1`          | ChannelAccessor&lt;Datum&gt;                                                                                 | the starting vertical position channel                              |
| `x2`          | ChannelAccessor&lt;Datum&gt;                                                                                 | the ending horizontal position channel                              |
| `y2`          | ChannelAccessor&lt;Datum&gt;                                                                                 | the ending vertical position channel                                |
| `bend?`       | ConstantAccessor&lt;number, Datum&gt; \| true                                                                | the bend angle, in degrees; defaults to 0°; true for 22.5°          |
| `headAngle?`  | ConstantAccessor&lt;number, Datum&gt;                                                                        | the arrowhead angle, in degrees; defaults to 60°                    |
| `headLength?` | ConstantAccessor&lt;number, Datum&gt;                                                                        | the arrowhead scale; defaults to 8                                  |
| `insetEnd?`   | ConstantAccessor&lt;number, Datum&gt;                                                                        | inset at the end of the arrow (useful if the arrow points to a dot) |
| `insetStart?` | ConstantAccessor&lt;number, Datum&gt;                                                                        | inset at the start of the arrow                                     |
| `inset?`      | ConstantAccessor&lt;number, Datum&gt;                                                                        | shorthand for the two insets                                        |
| `sweep?`      | SweepOption                                                                                                  | controls the sweep direction of the arrow arc; 1 or -1              |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## AxisX

Renders a horizontal axis with labels and tick marks

| Prop                    | Type                                                                                                        | Description                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `data?`                 | Datum[]                                                                                                     | custom tick values to display on the axis                                                     |
| `automatic?`            | boolean                                                                                                     | whether this axis was automatically added by the Plot component                               |
| `title?`                | string \| false \| null                                                                                     | the axis title label; set to false or null to hide                                            |
| `anchor?`               | 'top' \| 'bottom'                                                                                           | which edge of the plot the axis appears on                                                    |
| `interval?`             | string \| number                                                                                            | the interval between ticks, e.g. "day", "month", or a number                                  |
| `facetAnchor?`          | 'auto' \| 'top-empty' \| 'bottom-empty' \| 'top' \| 'bottom'                                                | controls which facet edge displays this axis                                                  |
| `labelAnchor?`          | 'auto' \| 'left' \| 'center' \| 'right'                                                                     | horizontal alignment of the axis title                                                        |
| `tickSize?`             | number                                                                                                      | the length of tick marks in pixels                                                            |
| `tickFontSize?`         | ConstantAccessor&lt;number, Datum&gt;                                                                       | font size for tick labels                                                                     |
| `titleFontSize?`        | number                                                                                                      | font size for the axis title                                                                  |
| `tickPadding?`          | number                                                                                                      | spacing between tick marks and tick labels in pixels                                          |
| `tickFormat?`           | 'auto' \| Intl.DateTimeFormatOptions \| Intl.NumberFormatOptions \| ((d: RawValue, i: number) =&gt; string) | formatter for tick labels; can be "auto", an Intl format options object, or a custom function |
| `tickClass?`            | ConstantAccessor&lt;string, Datum&gt;                                                                       | CSS class applied to each tick label                                                          |
| `ticks?`                | number \| string \| Datum[]                                                                                 | ticks is a shorthand for defining data, tickCount or interval                                 |
| `text?`                 | boolean \| null                                                                                             | set to false or null to disable tick labels                                                   |
| `tickCount?`            | number                                                                                                      | approximate number of ticks to be generated                                                   |
| `tickSpacing?`          | number                                                                                                      | approximate number of pixels between generated ticks                                          |
| `textAnchor?`           | ConstantAccessor&lt;CSS.Property.TextAnchor \| 'auto', Datum&gt;                                            | text anchor for axis labels                                                                   |
| `removeDuplicateTicks?` | boolean                                                                                                     | you can set this to true to remove duplicate tick labels                                      |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## AxisY

Renders a vertical axis with labels and tick marks

| Prop             | Type                                                                                             | Description                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `data?`          | Datum[]                                                                                          | custom tick values to display on the axis                                                     |
| `automatic?`     | boolean                                                                                          | whether this axis was automatically added by the Plot component                               |
| `title?`         | string \| false \| null                                                                          | the axis title label; set to false or null to hide                                            |
| `anchor?`        | 'left' \| 'right'                                                                                | which edge of the plot the axis appears on                                                    |
| `facetAnchor?`   | 'auto' \| 'left' \| 'right' \| 'left-empty' \| 'right-empty'                                     | controls which facet edge displays this axis                                                  |
| `lineAnchor?`    | 'top' \| 'center' \| 'bottom'                                                                    | vertical alignment of tick labels relative to the tick position                               |
| `interval?`      | string \| number                                                                                 | the interval between ticks, e.g. "day", "month", or a number                                  |
| `labelAnchor?`   | 'auto' \| 'left' \| 'center' \| 'right'                                                          | horizontal alignment of the axis title                                                        |
| `textAnchor?`    | 'auto' \| 'start' \| 'middle' \| 'end'                                                           | text anchor for tick labels                                                                   |
| `tickSize?`      | number                                                                                           | the length of tick marks in pixels                                                            |
| `tickFontSize?`  | ConstantAccessor&lt;number, Datum&gt;                                                            | font size for tick labels                                                                     |
| `titleFontSize?` | number                                                                                           | font size for the axis title                                                                  |
| `tickPadding?`   | number                                                                                           | spacing between tick marks and tick labels in pixels                                          |
| `tickFormat?`    | 'auto' \| Intl.DateTimeFormatOptions \| Intl.NumberFormatOptions \| ((d: RawValue) =&gt; string) | formatter for tick labels; can be "auto", an Intl format options object, or a custom function |
| `tickClass?`     | ConstantAccessor&lt;string, Datum&gt;                                                            | CSS class applied to each tick label                                                          |
| `ticks?`         | number \| string \| Datum[]                                                                      | ticks is a shorthand for defining data, tickCount or interval                                 |
| `text?`          | boolean \| null                                                                                  | set to false or null to disable tick labels                                                   |
| `tickCount?`     | number                                                                                           | approximate number of ticks to be generated                                                   |
| `tickSpacing?`   | number                                                                                           | approximate number of pixels between generated ticks                                          |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## BarX

For horizontal bar charts using a band scale as y axis

| Prop        | Type                                    | Description                                                                                    |
| ----------- | --------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `data`      | Datum[]                                 |                                                                                                |
| `x?`        | ChannelAccessor&lt;Datum&gt;            |                                                                                                |
| `x1?`       | ChannelAccessor&lt;Datum&gt;            |                                                                                                |
| `x2?`       | ChannelAccessor&lt;Datum&gt;            |                                                                                                |
| `y?`        | ChannelAccessor&lt;Datum&gt;            |                                                                                                |
| `stack?`    | [StackOptions](/api/marks#StackOptions) |                                                                                                |
| `canvas?`   | boolean                                 | Renders using Canvas instead of SVG.                                                           |
| `interval?` | number \| string                        | Converts x into x1/x2 ranges based on the provided interval. Disables the<br>implicit stacking |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [LinkableMarkProps](/api/marks#LinkableMarkProps), [BaseRectMarkProps](/api/marks#BaseRectMarkProps).

## BarY

For vertical column charts using a band scale as x axis

| Prop        | Type                                    | Description                                                                                    |
| ----------- | --------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `data`      | Datum[]                                 |                                                                                                |
| `x?`        | ChannelAccessor&lt;Datum&gt;            |                                                                                                |
| `y?`        | ChannelAccessor&lt;Datum&gt;            |                                                                                                |
| `y1?`       | ChannelAccessor&lt;Datum&gt;            |                                                                                                |
| `y2?`       | ChannelAccessor&lt;Datum&gt;            |                                                                                                |
| `stack?`    | [StackOptions](/api/marks#StackOptions) |                                                                                                |
| `canvas?`   | boolean                                 | Renders using Canvas instead of SVG.                                                           |
| `interval?` | number \| string                        | Converts y into y1/y2 ranges based on the provided interval. Disables the<br>implicit stacking |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [LinkableMarkProps](/api/marks#LinkableMarkProps), [BaseRectMarkProps](/api/marks#BaseRectMarkProps).

## BollingerX

line representing a moving average and an area representing volatility as a band

| Prop   | Type                         | Description                                                                             |
| ------ | ---------------------------- | --------------------------------------------------------------------------------------- |
| `data` | Datum[]                      | the input data array                                                                    |
| `x?`   | ChannelAccessor&lt;Datum&gt; | the horizontal position channel; the dependent variable for the moving average          |
| `y?`   | ChannelAccessor&lt;Datum&gt; | the vertical position channel; used for grouping                                        |
| `n?`   | number                       | the window size (the window transform's k option), an integer; defaults to 20           |
| `k?`   | number                       | the band radius, a number representing a multiple of standard deviations; defaults to 2 |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## BollingerY

line representing a moving average and an area representing volatility as a band

| Prop   | Type                         | Description                                                                             |
| ------ | ---------------------------- | --------------------------------------------------------------------------------------- |
| `data` | Datum[]                      | the input data array                                                                    |
| `x?`   | ChannelAccessor&lt;Datum&gt; | the horizontal position channel; used for grouping                                      |
| `y?`   | ChannelAccessor&lt;Datum&gt; | the vertical position channel; the dependent variable for the moving average            |
| `n?`   | number                       | the window size (the window transform's k option), an integer; defaults to 20           |
| `k?`   | number                       | the band radius, a number representing a multiple of standard deviations; defaults to 2 |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## BoxX

Creates a horizontal box plot for visualizing data distribution with quartiles and outliers

_No props found._

Inherited props from [BoxY](/api/marks#BoxY).

## BoxY

Creates a vertical box plot for visualizing data distribution with quartiles and outliers

| Prop          | Type                                                                                                                             | Description                                                         |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `data`        | Datum[]                                                                                                                          | the input data array                                                |
| `x`           | ChannelAccessor                                                                                                                  | the horizontal position channel; bound to a band scale for grouping |
| `y`           | ChannelAccessor                                                                                                                  | the vertical position channel; the quantitative values to summarize |
| `sort?`       | 'min' \| 'max' \| 'median' \| 'p25' \| 'p75' \| '-min' \| '-max' \| '-median' \| '-p25' \| '-p75' \| ((d: Datum) =&gt; RawValue) | Custom sort order for grouped box plot data                         |
| `rule?`       | Record&lt;string, ChannelAccessor&lt;Datum&gt;&gt;                                                                               | Options for the rule marks that represent the min/max range         |
| `bar?`        | Record&lt;string, ChannelAccessor&lt;Datum&gt;&gt;                                                                               | Options for the bar marks that represent the IQR range              |
| `tickMedian?` | Record&lt;string, ChannelAccessor&lt;Datum&gt;&gt; \| boolean                                                                    | Options for the tick marks that represent the median                |
| `tickMinMax?` | Record&lt;string, ChannelAccessor&lt;Datum&gt;&gt; \| boolean                                                                    | Options for the tick marks that represent the min/max range         |
| `dot?`        | Record&lt;string, ChannelAccessor&lt;Datum&gt;&gt;                                                                               | Options for the dot marks that represent the outliers               |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## Brush

For creating a two-dimensional brush selection

| Prop                 | Type                         | Description                                                                      |
| -------------------- | ---------------------------- | -------------------------------------------------------------------------------- |
| `brush`              | Brush                        | the brush state object (bindable); contains x1, x2, y1, y2, and enabled          |
| `limitDimension?`    | false \| 'x' \| 'y'          | limit brushing to x or y dimension                                               |
| `constrainToDomain?` | boolean                      | whether brush can move/resize outside domain                                     |
| `resizeHandleSize?`  | number                       | size of the (invisible) drag resize area around the edges of the brush selection |
| `onbrushstart?`      | (evt: BrushEvent) =&gt; void | called when the user starts dragging to create or move a brush                   |
| `onbrushend?`        | (evt: BrushEvent) =&gt; void | called when the user finishes dragging the brush                                 |
| `onbrush?`           | (evt: BrushEvent) =&gt; void | called continuously while the user is dragging the brush                         |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## BrushX

For creating a brush that can be dragged horizontally

_No props found._

Inherited props from [Brush](/api/marks#Brush).

## BrushY

For creating a brush that can be dragged vertically

_No props found._

Inherited props from [Brush](/api/marks#Brush).

## Cell

For arbitrary rectangles, requires band x and y scales

| Prop      | Type                         | Description                                                 |
| --------- | ---------------------------- | ----------------------------------------------------------- |
| `data`    | Datum[]                      | the input data array; each element becomes one cell         |
| `x?`      | ChannelAccessor&lt;Datum&gt; | the horizontal position channel; typically an ordinal value |
| `y?`      | ChannelAccessor&lt;Datum&gt; | the vertical position channel; typically an ordinal value   |
| `canvas?` | boolean                      | Renders using Canvas instead of SVG.                        |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [LinkableMarkProps](/api/marks#LinkableMarkProps), [BaseRectMarkProps](/api/marks#BaseRectMarkProps).

## CellX

For arbitrary rectangles with fixed y position, requires band x scale

| Prop   | Type    | Description          |
| ------ | ------- | -------------------- |
| `data` | Datum[] | the input data array |

Inherited props from [Cell](/api/marks#Cell).

## CellY

For arbitrary rectangles with fixed x position, requires band y scale

| Prop   | Type    | Description          |
| ------ | ------- | -------------------- |
| `data` | Datum[] | the input data array |

Inherited props from [Cell](/api/marks#Cell).

## ColorLegend

The ColorLegend is an HTML mark that can be placed in the header, footer and overlay snippets. You can activate an implicit ColorLegend above the chart using the global color.legend scale option.

| Prop    | Type           | Description                                       |
| ------- | -------------- | ------------------------------------------------- |
| `class` | string \| null | CSS class applied to the legend container element |

Inherited props: see the [shared section](/api/marks#Inherited-props) below.

## DifferenceY

| Prop                   | Type                                              | Description                                                              |
| ---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------ |
| `data`                 | Datum[]                                           | the input data array                                                     |
| `x1?`                  | ChannelAccessor&lt;Datum&gt;                      | the horizontal position of the comparison; bound to the x scale          |
| `x2?`                  | ChannelAccessor&lt;Datum&gt;                      | the horizontal position of the metric; bound to the x scale              |
| `x?`                   | ChannelAccessor&lt;Datum&gt;                      | the shared horizontal position channel; used when x1 and x2 are the same |
| `y1?`                  | ChannelAccessor&lt;Datum&gt;                      | the vertical position of the comparison; bound to the y scale            |
| `y2?`                  | ChannelAccessor&lt;Datum&gt;                      | the vertical position of the metric; bound to the y scale                |
| `y?`                   | ChannelAccessor&lt;Datum&gt;                      | the shared vertical position channel; used when y1 and y2 are the same   |
| `fillOpacity?`         | ConstantAccessor&lt;number, Datum&gt;             | the fill opacity for both positive and negative areas                    |
| `positiveFill?`        | string                                            | the stroke color of the "positive" area; defaults to 'blue'              |
| `positiveFillOpacity?` | number                                            | the fill opacity of the "positive" area; defaults to 1                   |
| `negativeFill?`        | string                                            | the stroke color of the "negative" area; defaults to 'red'               |
| `negativeFillOpacity?` | number                                            | the fill opacity of the "negative" area; defaults to 1                   |
| `curve?`               | [CurveName](/api/marks#CurveName) \| CurveFactory | curve type for the area; defaults to 'linear'                            |
| `tension?`             | number                                            | the tension of the area curve; defaults to 0                             |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## Dot

Creates dots or symbols at specified positions with customizable size and appearance

| Prop        | Type                                                              | Description                                                                 |
| ----------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `data?`     | Datum[]                                                           | the input data array; each element becomes one dot                          |
| `x?`        | ChannelAccessor&lt;Datum&gt;                                      | the horizontal position channel                                             |
| `y?`        | ChannelAccessor&lt;Datum&gt;                                      | the vertical position channel                                               |
| `r?`        | ChannelAccessor&lt;Datum&gt;                                      | the radius or symbol size channel; bound to the r scale                     |
| `symbol?`   | ChannelAccessor&lt;Datum&gt; \| Snippet&lt;[ number, string ]&gt; | the symbol shape channel; can be a symbol name accessor or a custom Snippet |
| `canvas?`   | boolean                                                           | if true, renders using Canvas instead of SVG                                |
| `dotClass?` | ConstantAccessor&lt;string, Datum&gt;                             | CSS class name(s) to apply to individual dot elements                       |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [LinkableMarkProps](/api/marks#LinkableMarkProps).

## DotX

Creates a horizontal dot plot with x values along a single y position

| Prop   | Type                         | Description                     |
| ------ | ---------------------------- | ------------------------------- |
| `data` | Datum[]                      | the input data array            |
| `x?`   | ChannelAccessor&lt;Datum&gt; | the horizontal position channel |

Inherited props from [Dot](/api/marks#Dot).

## DotY

Creates a horizontal dot plot with x values along a single y position

| Prop   | Type    | Description          |
| ------ | ------- | -------------------- |
| `data` | Datum[] | the input data array |

Inherited props from [Dot](/api/marks#Dot).

## Frame

Renders a simple frame around the entire plot domain

| Prop             | Type    | Description                                                      |
| ---------------- | ------- | ---------------------------------------------------------------- |
| `fill?`          | string  | the fill color of the frame                                      |
| `stroke?`        | string  | the stroke color of the frame                                    |
| `fillOpacity?`   | number  | the fill opacity of the frame                                    |
| `strokeOpacity?` | number  | the stroke opacity of the frame                                  |
| `opacity?`       | number  | the overall opacity of the frame                                 |
| `automatic?`     | boolean | whether this frame was automatically added by the Plot component |
| `inset?`         | number  | shorthand to inset the frame from all edges, in pixels           |
| `insetLeft?`     | number  | inset the frame from the left edge, in pixels                    |
| `insetRight?`    | number  | inset the frame from the right edge, in pixels                   |
| `insetTop?`      | number  | inset the frame from the top edge, in pixels                     |
| `insetBottom?`   | number  | inset the frame from the bottom edge, in pixels                  |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [BaseRectMarkProps](/api/marks#BaseRectMarkProps), [LinkableMarkProps](/api/marks#LinkableMarkProps).

## Geo

Renders geographical data using projections and GeoJSON geometries

| Prop          | Type                                               | Description                                              |
| ------------- | -------------------------------------------------- | -------------------------------------------------------- |
| `data?`       | Datum[] \| {'{'} type: 'Sphere'; {'}'}[]           | the input GeoJSON data array                             |
| `geoType?`    | 'sphere' \| 'graticule'                            | internal: whether this is a sphere or graticule geo mark |
| `dragRotate?` | boolean                                            | todo: implement?                                         |
| `canvas?`     | boolean                                            | toggle canvas rendering mode                             |
| `title?`      | ConstantAccessor&lt;string, Datum&gt;              | simple browser tooltip to be displayed on mouseover      |
| `r?`          | ChannelAccessor&lt;Datum&gt;                       | radius for point features                                |
| `svgFilter?`  | ConstantAccessor&lt;string \| undefined, Datum&gt; | SVG filter attribute applied to each geo path element    |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [LinkableMarkProps](/api/marks#LinkableMarkProps).

## Graticule

Renders a geographic graticule grid with customizable step sizes

| Prop     | Type   | Description                                                        |
| -------- | ------ | ------------------------------------------------------------------ |
| `step?`  | number | the step size for both longitude and latitude gridlines in degrees |
| `stepX?` | number | the step size for longitude gridlines in degrees                   |
| `stepY?` | number | the step size for latitude gridlines in degrees                    |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## GridX

Renders vertical gridlines at x-axis tick positions

| Prop         | Type                         | Description                                                            |
| ------------ | ---------------------------- | ---------------------------------------------------------------------- |
| `data?`      | Datum[]                      | custom values at which to draw vertical gridlines                      |
| `automatic?` | boolean                      | whether these gridlines were automatically added by the Plot component |
| `y1?`        | ChannelAccessor&lt;Datum&gt; | the starting vertical position of the gridline                         |
| `y2?`        | ChannelAccessor&lt;Datum&gt; | the ending vertical position of the gridline                           |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## GridY

Renders horizontal gridlines at y-axis tick positions

| Prop         | Type                         | Description                                                            |
| ------------ | ---------------------------- | ---------------------------------------------------------------------- |
| `data?`      | Datum[]                      | custom values at which to draw horizontal gridlines                    |
| `automatic?` | boolean                      | whether these gridlines were automatically added by the Plot component |
| `x1?`        | ChannelAccessor&lt;Datum&gt; | the starting horizontal position of the gridline                       |
| `x2?`        | ChannelAccessor&lt;Datum&gt; | the ending horizontal position of the gridline                         |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## HTMLTooltip

For showing custom HTML tooltips positioned at x/y coordinates

| Prop       | Type                                         | Description                                                           |
| ---------- | -------------------------------------------- | --------------------------------------------------------------------- |
| `data`     | Datum[]                                      | the input data array                                                  |
| `x?`       | ChannelAccessor&lt;Datum&gt;                 | the horizontal position channel; bound to the x scale                 |
| `y?`       | ChannelAccessor&lt;Datum&gt;                 | the vertical position channel; bound to the y scale                   |
| `r?`       | ChannelAccessor&lt;Datum&gt;                 | the radius channel, used for positioning with dot-based data          |
| `fx?`      | ChannelAccessor&lt;Datum&gt;                 | the horizontal facet channel                                          |
| `fy?`      | ChannelAccessor&lt;Datum&gt;                 | the vertical facet channel                                            |
| `children` | Snippet&lt;[ {'{'} datum: Datum; {'}'} ]&gt; | snippet for rendering the tooltip content; receives the nearest datum |

Inherited props: see the [shared section](/api/marks#Inherited-props) below.

## Image

For showing images positioned at x/y coordinates

| Prop                   | Type                                  | Description                                                                |
| ---------------------- | ------------------------------------- | -------------------------------------------------------------------------- |
| `data`                 | Datum[]                               | the input data array; each element becomes one image                       |
| `x`                    | ChannelAccessor&lt;Datum&gt;          | the horizontal position channel                                            |
| `y`                    | ChannelAccessor&lt;Datum&gt;          | the vertical position channel                                              |
| `r?`                   | ChannelAccessor&lt;Datum&gt;          | the clip radius for the image in pixels                                    |
| `width?`               | ConstantAccessor&lt;number, Datum&gt; | the width of the image in pixels                                           |
| `height?`              | ConstantAccessor&lt;number, Datum&gt; | the height of the image in pixels                                          |
| `src?`                 | ConstantAccessor&lt;string, Datum&gt; | the image source URL                                                       |
| `title?`               | ConstantAccessor&lt;string, Datum&gt; | the title attribute for the image element (shown as a browser tooltip)     |
| `preserveAspectRatio?` | string                                | the SVG preserveAspectRatio attribute for the image (e.g. "xMidYMid meet") |
| `imageClass?`          | ConstantAccessor&lt;string, Datum&gt; | CSS class name(s) to apply to individual image elements                    |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [LinkableMarkProps](/api/marks#LinkableMarkProps).

## Line

Creates line charts with connecting points in a dataset with customizable curves and markers

| Prop                    | Type                                                                                | Description                                                                             |
| ----------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `data?`                 | Datum[]                                                                             | the input data array; each element becomes one point in the line                        |
| `x?`                    | ChannelAccessor&lt;Datum&gt;                                                        | the horizontal position channel                                                         |
| `y?`                    | ChannelAccessor&lt;Datum&gt;                                                        | the vertical position channel                                                           |
| `z?`                    | ChannelAccessor&lt;Datum&gt;                                                        | the series channel; data is grouped into separate lines by unique z values              |
| `outlineStroke?`        | string                                                                              | the stroke color for the line outline                                                   |
| `outlineStrokeWidth?`   | number                                                                              | the stroke width of the line outline in pixels                                          |
| `outlineStrokeOpacity?` | number                                                                              | the stroke opacity for the line outline; a number between 0 and 1                       |
| `curve?`                | [CurveName](/api/marks#CurveName) \| CurveFactory \| 'auto'                         | the curve interpolation method for connecting data points (e.g. "basis", "catmull-rom") |
| `tension?`              | number                                                                              | the tension parameter for cardinal or Catmull-Rom curve interpolation                   |
| `sort?`                 | ConstantAccessor&lt;RawValue, Datum&gt; \| {'{'} channel: 'stroke' \| 'fill'; {'}'} | controls the order of data points before rendering                                      |
| `text?`                 | ConstantAccessor&lt;string, Datum&gt;                                               | text label to render along the line path using a textPath element                       |
| `textFill?`             | ConstantAccessor&lt;string, Datum&gt;                                               | the fill color for the text label rendered along the line                               |
| `textStroke?`           | ConstantAccessor&lt;string, Datum&gt;                                               | the stroke color for the text label rendered along the line                             |
| `textStartOffset?`      | ConstantAccessor&lt;string, Datum&gt;                                               | the offset position for the text label along the line path (e.g. "50%")                 |
| `textStrokeWidth?`      | ConstantAccessor&lt;number, Datum&gt;                                               | the stroke width for the text label rendered along the line in pixels                   |
| `lineClass?`            | ConstantAccessor&lt;string, Datum&gt;                                               | CSS class name(s) to apply to individual line elements                                  |
| `canvas?`               | boolean                                                                             | if true, renders using Canvas instead of SVG                                            |

Inherited props from [MarkerOptions](/api/marks#MarkerOptions), [BaseMarkProps](/api/marks#BaseMarkProps).

## LineX

Creates a horizontal line chart with x values and index positions for y

| Prop   | Type    | Description          |
| ------ | ------- | -------------------- |
| `data` | Datum[] | the input data array |

Inherited props from [Line](/api/marks#Line).

## LineY

Creates a horizontal line chart with x values and index positions for y

| Prop   | Type    | Description          |
| ------ | ------- | -------------------- |
| `data` | Datum[] | the input data array |

Inherited props from [Line](/api/marks#Line).

## Link

Creates connections between pairs of points with optional curve styling and markers

| Prop               | Type                                                                                | Description                                                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `data?`            | Datum[]                                                                             | the input data array; each element becomes one link                                                                                    |
| `sort?`            | ConstantAccessor&lt;RawValue, Datum&gt; \| {'{'} channel: 'stroke' \| 'fill'; {'}'} | sort order for data points before rendering                                                                                            |
| `x1?`              | ChannelAccessor&lt;Datum&gt;                                                        | the x1 channel accessor for the start of the link                                                                                      |
| `y1?`              | ChannelAccessor&lt;Datum&gt;                                                        | the y1 channel accessor for the start of the link                                                                                      |
| `x2?`              | ChannelAccessor&lt;Datum&gt;                                                        | the x2 channel accessor for the end of the link                                                                                        |
| `y2?`              | ChannelAccessor&lt;Datum&gt;                                                        | the y2 channel accessor for the end of the link                                                                                        |
| `curve?`           | 'auto' \| [CurveName](/api/marks#CurveName) \| CurveFactory                         | the curve type, defaults to 'auto' which uses a linear curve for planar projections<br>and a spherical line for geographic projections |
| `tension?`         | number                                                                              | the tension of the curve, defaults to 0                                                                                                |
| `bend?`            | number \| boolean                                                                   | legacy alias for link curvature                                                                                                        |
| `text?`            | ConstantAccessor&lt;string, Datum&gt;                                               | the text label for the link, can be a constant or a function                                                                           |
| `textFill?`        | ConstantAccessor&lt;string, Datum&gt;                                               | the fill color for the text label rendered along the link                                                                              |
| `textStroke?`      | ConstantAccessor&lt;string, Datum&gt;                                               | the stroke color for the text label rendered along the link                                                                            |
| `textStartOffset?` | ConstantAccessor&lt;string, Datum&gt;                                               | the offset position for the text label along the link path                                                                             |
| `textStrokeWidth?` | ConstantAccessor&lt;number, Datum&gt;                                               | the stroke width for the text label rendered along the link                                                                            |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [MarkerOptions](/api/marks#MarkerOptions).

## Pointer

| Prop           | Type                                          | Description                                                                                      |
| -------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `data`         | Datum[]                                       | the input data array                                                                             |
| `children?`    | Snippet&lt;[ {'{'} data: Datum[]; {'}'} ]&gt; | snippet rendered with the currently selected data points                                         |
| `x?`           | ChannelAccessor&lt;Datum&gt;                  | the horizontal position channel; bound to the x scale                                            |
| `y?`           | ChannelAccessor&lt;Datum&gt;                  | the vertical position channel; bound to the y scale                                              |
| `z?`           | ChannelAccessor&lt;Datum&gt;                  | grouping channel for splitting data into separate search trees                                   |
| `fx?`          | ChannelAccessor&lt;Datum&gt;                  | the horizontal facet channel                                                                     |
| `fy?`          | ChannelAccessor&lt;Datum&gt;                  | the vertical facet channel                                                                       |
| `maxDistance?` | number                                        | maximum cursor distance to select data points                                                    |
| `tolerance?`   | number                                        | tolerance for considering points as "the same" when sharing x or y values<br>defaults to 0 pixel |
| `onupdate?`    | (data: Datum[]) =&gt; void                    | called whenever the selection changes                                                            |

Inherited props: see the [shared section](/api/marks#Inherited-props) below.

## Rect

For arbitrary rectangles, requires quantitative x and y scales

| Prop        | Type                         | Description                                                                       |
| ----------- | ---------------------------- | --------------------------------------------------------------------------------- |
| `data?`     | Datum[]                      | the input data array; each element becomes one rectangle                          |
| `x?`        | ChannelAccessor&lt;Datum&gt; | the horizontal position channel; used as shorthand for x1 and x2 with an interval |
| `x1?`       | ChannelAccessor&lt;Datum&gt; | the starting horizontal position channel                                          |
| `x2?`       | ChannelAccessor&lt;Datum&gt; | the ending horizontal position channel                                            |
| `y?`        | ChannelAccessor&lt;Datum&gt; | the vertical position channel; used as shorthand for y1 and y2 with an interval   |
| `y1?`       | ChannelAccessor&lt;Datum&gt; | the starting vertical position channel                                            |
| `y2?`       | ChannelAccessor&lt;Datum&gt; | the ending vertical position channel                                              |
| `interval?` | number \| string             | converts x/y into x1/x2 or y1/y2 ranges based on the provided interval            |
| `class?`    | string                       | additional CSS class name(s) for the rect element                                 |
| `canvas?`   | boolean                      | Renders using Canvas instead of SVG.                                              |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [LinkableMarkProps](/api/marks#LinkableMarkProps), [BaseRectMarkProps](/api/marks#BaseRectMarkProps).

## RectX

Convenience wrapper for rectangles oriented along the x axis

| Prop     | Type                                                   | Description                           |
| -------- | ------------------------------------------------------ | ------------------------------------- |
| `stack?` | Partial&lt;[StackOptions](/api/marks#StackOptions)&gt; | options for stacking rect data values |

Inherited props from [Rect](/api/marks#Rect).

## RectY

Convenience wrapper for rectangles oriented along the x axis

| Prop     | Type                                                   | Description                           |
| -------- | ------------------------------------------------------ | ------------------------------------- |
| `stack?` | Partial&lt;[StackOptions](/api/marks#StackOptions)&gt; | options for stacking rect data values |

Inherited props from [Rect](/api/marks#Rect).

## RegressionX

Calculates and displays a regression line with x as the dependent variable

_No props found._

Inherited props: see the [shared section](/api/marks#Inherited-props) below.

## RegressionY

Calculates and displays a regression line with y as the dependent variable

_No props found._

Inherited props: see the [shared section](/api/marks#Inherited-props) below.

## RuleX

Renders vertical rule lines at specified x positions with customizable vertical range

| Prop           | Type                                  | Description                                                  |
| -------------- | ------------------------------------- | ------------------------------------------------------------ |
| `data?`        | Datum[]                               | the input data array; each element becomes one vertical rule |
| `x?`           | ChannelAccessor&lt;Datum&gt;          | the horizontal position channel for the rule                 |
| `y1?`          | ChannelAccessor&lt;Datum&gt;          | the starting vertical position of the rule                   |
| `y2?`          | ChannelAccessor&lt;Datum&gt;          | the ending vertical position of the rule                     |
| `inset?`       | ConstantAccessor&lt;number, Datum&gt; | shorthand to inset the rule from both ends, in pixels        |
| `insetTop?`    | ConstantAccessor&lt;number, Datum&gt; | inset the rule from the top, in pixels                       |
| `insetBottom?` | ConstantAccessor&lt;number, Datum&gt; | inset the rule from the bottom, in pixels                    |
| `canvas?`      | boolean                               | if true, renders using Canvas instead of SVG                 |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## RuleY

Renders horizontal rule lines at specified y positions with customizable horizontal range

| Prop          | Type                                  | Description                                                    |
| ------------- | ------------------------------------- | -------------------------------------------------------------- |
| `data?`       | Datum[]                               | the input data array; each element becomes one horizontal rule |
| `y?`          | ChannelAccessor&lt;Datum&gt;          | the vertical position channel for the rule                     |
| `x1?`         | ChannelAccessor&lt;Datum&gt;          | the starting horizontal position of the rule                   |
| `x2?`         | ChannelAccessor&lt;Datum&gt;          | the ending horizontal position of the rule                     |
| `inset?`      | ConstantAccessor&lt;number, Datum&gt; | shorthand to inset the rule from both ends, in pixels          |
| `insetLeft?`  | ConstantAccessor&lt;number, Datum&gt; | inset the rule from the left, in pixels                        |
| `insetRight?` | ConstantAccessor&lt;number, Datum&gt; | inset the rule from the right, in pixels                       |
| `canvas?`     | boolean                               | if true, renders using Canvas instead of SVG                   |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## Sphere

Geo mark with Sphere geometry object

_No props found._

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [LinkableMarkProps](/api/marks#LinkableMarkProps).

## Spike

Wrapper around the vector mark with presets suitable for spike maps

| Prop      | Type                         | Description                                           |
| --------- | ---------------------------- | ----------------------------------------------------- |
| `data?`   | Datum[]                      | the input data array; each element becomes one spike  |
| `x?`      | ChannelAccessor&lt;Datum&gt; | the horizontal position channel; bound to the x scale |
| `y?`      | ChannelAccessor&lt;Datum&gt; | the vertical position channel; bound to the y scale   |
| `r?`      | number                       | the radius (width) of the spike base in pixels        |
| `length?` | ChannelAccessor&lt;Datum&gt; | the length of the spike in pixels                     |
| `rotate?` | ChannelAccessor&lt;Datum&gt; | rotation angle of the spike in degrees                |

Inherited props: see the [shared section](/api/marks#Inherited-props) below.

## Text

Useful for adding SVG text labels to your plot.

| Prop              | Type                                                                                                                                                        | Description                                                                                         |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `data?`           | Datum[]                                                                                                                                                     | the input data array; each element becomes one text label                                           |
| `x?`              | ChannelAccessor&lt;Datum&gt;                                                                                                                                | the horizontal position channel                                                                     |
| `y?`              | ChannelAccessor&lt;Datum&gt;                                                                                                                                | the vertical position channel                                                                       |
| `r?`              | ChannelAccessor&lt;Datum&gt;                                                                                                                                | optional radius channel, mainly for dodge/sort convenience in label swarms                          |
| `children?`       | Snippet                                                                                                                                                     | a Snippet to render as the text content                                                             |
| `text`            | ConstantAccessor&lt;string \| null \| false \| undefined, Datum&gt;                                                                                         | the text content accessor                                                                           |
| `title?`          | ConstantAccessor&lt;string, Datum&gt;                                                                                                                       | the title attribute for the text element (shown as a browser tooltip)                               |
| `fontFamily?`     | ConstantAccessor&lt;CSS.Property.FontFamily, Datum&gt;                                                                                                      | the font family of the text                                                                         |
| `fontSize?`       | ConstantAccessor&lt;CSS.Property.FontSize \| number, Datum&gt;                                                                                              | the font size of the text; can be a CSS string or number in pixels                                  |
| `fontWeight?`     | ConstantAccessor&lt;CSS.Property.FontWeight, Datum&gt;                                                                                                      | the font weight of the text (e.g. "bold", 700)                                                      |
| `fontStyle?`      | ConstantAccessor&lt;CSS.Property.FontStyle, Datum&gt;                                                                                                       | the font style of the text (e.g. "italic", "normal")                                                |
| `fontVariant?`    | ConstantAccessor&lt;CSS.Property.FontVariant, Datum&gt;                                                                                                     | the font variant of the text (e.g. "small-caps")                                                    |
| `letterSpacing?`  | ConstantAccessor&lt;CSS.Property.LetterSpacing, Datum&gt;                                                                                                   | the letter spacing of the text                                                                      |
| `wordSpacing?`    | ConstantAccessor&lt;CSS.Property.WordSpacing, Datum&gt;                                                                                                     | the word spacing of the text                                                                        |
| `textTransform?`  | ConstantAccessor&lt;CSS.Property.TextTransform, Datum&gt;                                                                                                   | the text transform (e.g. "uppercase", "lowercase")                                                  |
| `textDecoration?` | ConstantAccessor&lt;CSS.Property.TextDecoration, Datum&gt;                                                                                                  | the text decoration (e.g. "underline", "line-through")                                              |
| `textAnchor?`     | ConstantAccessor&lt;CSS.Property.TextAnchor, Datum&gt;                                                                                                      | the horizontal text anchor; start, end, or middle                                                   |
| `lineAnchor?`     | ConstantAccessor&lt;'bottom' \| 'top' \| 'middle'&gt;                                                                                                       | the line anchor for vertical position; top, bottom, or middle                                       |
| `lineHeight?`     | ConstantAccessor&lt;number, Datum&gt;                                                                                                                       | line height as multiplier of font size                                                              |
| `frameAnchor?`    | ConstantAccessor&lt;'bottom' \| 'top' \| 'left' \| 'right' \| 'top-left' \| 'bottom-left' \| 'top-right' \| 'bottom-right' \| 'middle' \| string, Datum&gt; | the anchor position within the plot frame when x or y are not specified (e.g. "top-left", "middle") |
| `rotate?`         | ConstantAccessor&lt;number, Datum&gt;                                                                                                                       | rotate text by angle in degrees                                                                     |
| `canvas?`         | false \| undefined \| true                                                                                                                                  | renders texts as canvas instead of SVG                                                              |
| `textClass?`      | ConstantAccessor&lt;string, Datum&gt;                                                                                                                       | if you want to apply class names to individual text elements. Only supported in SVG rendering.      |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [LinkableMarkProps](/api/marks#LinkableMarkProps).

## TickX

The TickX mark is useful for showing one-dimensional distributions along the x axis. The y axis must be a band scale.

| Prop          | Type                                  | Description                                                                                                                                                      |
| ------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`        | Datum[]                               | the input data array; each element becomes one vertical tick                                                                                                     |
| `x?`          | ChannelAccessor&lt;Datum&gt;          | the horizontal position; bound to the x scale                                                                                                                    |
| `y?`          | ChannelAccessor&lt;Datum&gt;          | the vertical position; bound to the y scale, which must be band. If the y channel<br>is not specified, the tick will span the full vertical extent of the frame. |
| `tickLength?` | ConstantAccessor&lt;number, Datum&gt; | if ticks are used on a non-bandwidth scale, this will determine the<br>length of the tick. Defaults to 10 pixel                                                  |
| `canvas?`     | boolean                               | if true, renders using Canvas instead of SVG                                                                                                                     |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## TickY

The TickY mark is useful for showing one-dimensional distributions along the y axis. The x axis must be a band scale.

| Prop          | Type                                  | Description                                                                                                                                                          |
| ------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`        | Datum[]                               | the input data array; each element becomes one horizontal tick                                                                                                       |
| `y?`          | ChannelAccessor&lt;Datum&gt;          | the vertical position; bound to the y scale                                                                                                                          |
| `x?`          | ChannelAccessor&lt;Datum&gt;          | the horizontal position; bound to the x scale, which must be band. If the x channel<br>is not specified, the tick will span the full horizontal extent of the frame. |
| `tickLength?` | ConstantAccessor&lt;number, Datum&gt; | if ticks are used on a non-bandwidth scale, this will determine the<br>length of the tick. Defaults to 10 pixel                                                      |
| `canvas?`     | boolean                               | if true, renders using Canvas instead of SVG                                                                                                                         |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## Trail

| Prop          | Type                                                                                | Description                                                                      |
| ------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `data?`       | Datum[]                                                                             | the input data array                                                             |
| `x?`          | ChannelAccessor&lt;Datum&gt;                                                        | the horizontal position channel; bound to the x scale                            |
| `y?`          | ChannelAccessor&lt;Datum&gt;                                                        | the vertical position channel; bound to the y scale                              |
| `z?`          | ChannelAccessor&lt;Datum&gt;                                                        | grouping channel for splitting data into separate trails                         |
| `r?`          | ChannelAccessor&lt;Datum&gt;                                                        | the radius (width) of the trail at each data point                               |
| `curve?`      | [CurveName](/api/marks#CurveName) \| CurveFactory                                   | the curve interpolation type for connecting data points                          |
| `tension?`    | number                                                                              | tension parameter for the curve interpolation                                    |
| `sort?`       | ConstantAccessor&lt;RawValue, Datum&gt; \| {'{'} channel: 'stroke' \| 'fill'; {'}'} | sort order for data points before rendering                                      |
| `defined?`    | ConstantAccessor&lt;boolean, Datum&gt;                                              | accessor that returns false for data points that should create gaps in the trail |
| `canvas?`     | boolean                                                                             | if true, renders using Canvas instead of SVG                                     |
| `cap?`        | 'butt' \| 'round'                                                                   | the cap style for trail endpoints                                                |
| `resolution?` | number \| 'auto'                                                                    | Samples per segment for curve interpolation                                      |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## WaffleX

The waffleX mark lets you create waffle charts by filling a rectangular area with small squares representing data values.

| Prop     | Type                                    | Description                                                     |
| -------- | --------------------------------------- | --------------------------------------------------------------- |
| `data?`  | Datum[]                                 | the input data array                                            |
| `x?`     | ChannelAccessor&lt;Datum&gt;            | the horizontal position channel; bound to a quantitative scale  |
| `x1?`    | ChannelAccessor&lt;Datum&gt;            | the starting horizontal position; bound to a quantitative scale |
| `x2?`    | ChannelAccessor&lt;Datum&gt;            | the ending horizontal position; bound to a quantitative scale   |
| `y?`     | ChannelAccessor&lt;Datum&gt;            | the vertical position channel; bound to a band scale            |
| `stack?` | [StackOptions](/api/marks#StackOptions) | stacking options for combining multiple series                  |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [LinkableMarkProps](/api/marks#LinkableMarkProps).

## WaffleY

The waffleX mark lets you create waffle charts by filling a rectangular area with small squares representing data values.

| Prop    | Type                         | Description                                                   |
| ------- | ---------------------------- | ------------------------------------------------------------- |
| `data?` | Datum[]                      | the input data array                                          |
| `x?`    | ChannelAccessor&lt;Datum&gt; | the horizontal position channel; bound to a band scale        |
| `y?`    | ChannelAccessor&lt;Datum&gt; | the vertical position channel; bound to a quantitative scale  |
| `y1?`   | ChannelAccessor&lt;Datum&gt; | the starting vertical position; bound to a quantitative scale |
| `y2?`   | ChannelAccessor&lt;Datum&gt; | the ending vertical position; bound to a quantitative scale   |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [LinkableMarkProps](/api/marks#LinkableMarkProps).

## Inherited props

These props are shared by marks via the base type aliases.

### BaseMarkProps

| Prop               | Type                                                                                                                                                            | Description                                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `filter`           | ConstantAccessor&lt;boolean, T&gt;                                                                                                                              | Filter the data without modifying the inferred scales                                                                                    |
| `facet`            | 'auto' \| 'include' \| 'exclude'                                                                                                                                | controls whether this mark participates in faceting; "exclude" to ignore facet filters, "include" to require matching facet values       |
| `fx`               | ChannelAccessor&lt;T&gt;                                                                                                                                        | the horizontal facet channel                                                                                                             |
| `fy`               | ChannelAccessor&lt;T&gt;                                                                                                                                        | the vertical facet channel                                                                                                               |
| `dx`               | ConstantAccessor&lt;number, T&gt;                                                                                                                               | a horizontal offset in pixels applied after scaling                                                                                      |
| `dy`               | ConstantAccessor&lt;number, T&gt;                                                                                                                               | a vertical offset in pixels applied after scaling                                                                                        |
| `dodgeX`           | [DodgeXOptions](/api/marks#DodgeXOptions)                                                                                                                       | options for horizontal dodge positioning to avoid overlapping marks                                                                      |
| `dodgeY`           | [DodgeYOptions](/api/marks#DodgeYOptions)                                                                                                                       | options for vertical dodge positioning to avoid overlapping marks                                                                        |
| `fill`             | ChannelAccessor&lt;T&gt;                                                                                                                                        | the fill color; can be a fixed CSS color string or a channel accessor bound to the color scale                                           |
| `fillOpacity`      | ConstantAccessor&lt;number, T&gt;                                                                                                                               | the fill opacity; a number between 0 and 1                                                                                               |
| `fontFamily`       | ConstantAccessor&lt;CSS.Property.FontFamily, T&gt;                                                                                                              | font family for text-capable marks                                                                                                       |
| `fontSize`         | ConstantAccessor&lt;CSS.Property.FontSize \| number, T&gt;                                                                                                      | font size for text-capable marks                                                                                                         |
| `fontStyle`        | ConstantAccessor&lt;CSS.Property.FontStyle, T&gt;                                                                                                               | font style for text-capable marks                                                                                                        |
| `fontVariant`      | ConstantAccessor&lt;CSS.Property.FontVariant, T&gt;                                                                                                             | font variant for text-capable marks                                                                                                      |
| `fontWeight`       | ConstantAccessor&lt;CSS.Property.FontWeight, T&gt;                                                                                                              | font weight for text-capable marks                                                                                                       |
| `letterSpacing`    | ConstantAccessor&lt;CSS.Property.LetterSpacing, T&gt;                                                                                                           | letter spacing for text-capable marks                                                                                                    |
| `wordSpacing`      | ConstantAccessor&lt;CSS.Property.WordSpacing, T&gt;                                                                                                             | word spacing for text-capable marks                                                                                                      |
| `textAnchor`       | ConstantAccessor&lt;CSS.Property.TextAnchor, T&gt;                                                                                                              | text anchor for text-capable marks                                                                                                       |
| `textTransform`    | ConstantAccessor&lt;CSS.Property.TextTransform, T&gt;                                                                                                           | text transform for text-capable marks                                                                                                    |
| `textDecoration`   | ConstantAccessor&lt;CSS.Property.TextDecoration, T&gt;                                                                                                          | text decoration for text-capable marks                                                                                                   |
| `sort`             | string \| ConstantAccessor&lt;RawValue, T&gt; \| ((a: RawValue, b: RawValue) =&gt; number) \| {'{'} channel: string; order?: 'ascending' \| 'descending'; {'}'} | how to sort the mark data before rendering; can be a channel name string, an accessor, a comparator, or an object with channel and order |
| `stroke`           | ChannelAccessor&lt;T&gt;                                                                                                                                        | the stroke color; can be a fixed CSS color string or a channel accessor bound to the color scale                                         |
| `strokeWidth`      | ConstantAccessor&lt;number, T&gt;                                                                                                                               | the stroke width in pixels                                                                                                               |
| `strokeOpacity`    | ConstantAccessor&lt;number, T&gt;                                                                                                                               | the stroke opacity; a number between 0 and 1                                                                                             |
| `strokeLinejoin`   | ConstantAccessor&lt;CSS.Property.StrokeLinejoin, T&gt;                                                                                                          | the SVG stroke line join style (e.g. "round", "bevel")                                                                                   |
| `strokeLinecap`    | ConstantAccessor&lt;CSS.Property.StrokeLinecap, T&gt;                                                                                                           | the SVG stroke line cap style (e.g. "round", "butt")                                                                                     |
| `strokeMiterlimit` | ConstantAccessor&lt;number, T&gt;                                                                                                                               | the SVG stroke miter limit                                                                                                               |
| `opacity`          | ChannelAccessor&lt;T&gt;                                                                                                                                        | the overall element opacity; can be a fixed number or a channel accessor bound to the opacity scale                                      |
| `strokeDasharray`  | ConstantAccessor&lt;string, T&gt;                                                                                                                               | the SVG stroke dash pattern (e.g. "4 2")                                                                                                 |
| `strokeDashoffset` | ConstantAccessor&lt;number, T&gt;                                                                                                                               | the SVG stroke dash offset in pixels                                                                                                     |
| `blend`            | ConstantAccessor&lt;CSS.Property.MixBlendMode, T&gt;                                                                                                            | the CSS mix-blend-mode for compositing (e.g. "multiply", "screen")                                                                       |
| `mixBlendMode`     | ConstantAccessor&lt;CSS.Property.MixBlendMode, T&gt;                                                                                                            | legacy alias of blend                                                                                                                    |
| `clipPath`         | string                                                                                                                                                          | a CSS clip-path to clip the mark element                                                                                                 |
| `mask`             | string                                                                                                                                                          | a CSS mask to apply to the mark element                                                                                                  |
| `imageFilter`      | ConstantAccessor&lt;string, T&gt;                                                                                                                               | a CSS filter to apply to the mark element (e.g. "blur(2px)")                                                                             |
| `shapeRendering`   | ConstantAccessor&lt;CSS.Property.ShapeRendering, T&gt;                                                                                                          | the SVG shape-rendering attribute (e.g. "crispEdges", "geometricPrecision")                                                              |
| `paintOrder`       | ConstantAccessor&lt;string, T&gt;                                                                                                                               | the SVG paint-order attribute (e.g. "stroke" to render stroke behind fill)                                                               |
| `onclick`          | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when the mark element is clicked                                                                                                   |
| `ondblclick`       | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when the mark element is double-clicked                                                                                            |
| `onmouseup`        | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when a mouse button is released over the mark                                                                                      |
| `onmousedown`      | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when a mouse button is pressed over the mark                                                                                       |
| `onmouseenter`     | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when the pointer enters the mark element                                                                                           |
| `onmousemove`      | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when the pointer moves within the mark element                                                                                     |
| `onmouseleave`     | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when the pointer leaves the mark element                                                                                           |
| `onmouseout`       | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when the pointer moves out of the mark element                                                                                     |
| `onmouseover`      | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when the pointer moves onto the mark element                                                                                       |
| `onpointercancel`  | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when a pointer event is canceled                                                                                                   |
| `onpointerdown`    | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when a pointer becomes active over the mark                                                                                        |
| `onpointerup`      | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when a pointer is released over the mark                                                                                           |
| `onpointerenter`   | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when a pointer enters the mark element                                                                                             |
| `onpointerleave`   | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when a pointer leaves the mark element                                                                                             |
| `onpointermove`    | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when a pointer moves within the mark element                                                                                       |
| `onpointerover`    | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when a pointer moves onto the mark element                                                                                         |
| `onpointerout`     | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when a pointer moves out of the mark element                                                                                       |
| `ondrag`           | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired continuously while the mark is being dragged                                                                                       |
| `ondrop`           | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when a dragged element is dropped on the mark                                                                                      |
| `ondragstart`      | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when a drag operation begins on the mark                                                                                           |
| `ondragenter`      | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when a dragged element enters the mark                                                                                             |
| `ondragleave`      | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when a dragged element leaves the mark                                                                                             |
| `ondragover`       | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when a dragged element is over the mark                                                                                            |
| `ondragend`        | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when a drag operation ends                                                                                                         |
| `ontouchstart`     | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when a touch point is placed on the mark                                                                                           |
| `ontouchmove`      | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when a touch point moves along the mark                                                                                            |
| `ontouchend`       | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when a touch point is removed from the mark                                                                                        |
| `ontouchcancel`    | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when a touch event is canceled                                                                                                     |
| `oncontextmenu`    | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when the context menu is triggered on the mark                                                                                     |
| `onwheel`          | MarkEventHandler&lt;T, SVGPathElement&gt;                                                                                                                       | fired when the mouse wheel is scrolled over the mark                                                                                     |
| `class`            | string                                                                                                                                                          | if you want to give your mark element an extra CSS class                                                                                 |
| `style`            | string                                                                                                                                                          | if you want to give your mark element an extra inline style                                                                              |
| `cursor`           | ConstantAccessor&lt;CSS.Property.Cursor, T&gt;                                                                                                                  | the CSS cursor style when hovering over the mark (e.g. "pointer", "crosshair")                                                           |

### MarkerOptions

| Prop           | Type                                                        | Description                                                     |
| -------------- | ----------------------------------------------------------- | --------------------------------------------------------------- |
| `markerStart?` | boolean \| [MarkerShape](/api/marks#MarkerShape) \| Snippet | the marker for the starting point of a line segment             |
| `markerMid?`   | boolean \| [MarkerShape](/api/marks#MarkerShape) \| Snippet | the marker for any intermediate point of a line segment         |
| `markerEnd?`   | boolean \| [MarkerShape](/api/marks#MarkerShape) \| Snippet | the marker for the end point of a line segment                  |
| `marker?`      | boolean \| [MarkerShape](/api/marks#MarkerShape) \| Snippet | shorthand for setting the marker on all points                  |
| `markerScale?` | ConstantAccessor&lt;number&gt;                              | scale factor for marker size, relative to the line stroke width |

### LinkableMarkProps

| Prop        | Type                                                                                | Description                                                                |
| ----------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `href?`     | ConstantAccessor&lt;string, T&gt;                                                   | if set, the mark element will be wrapped in a &lt;a&gt; link element       |
| `rel?`      | ConstantAccessor&lt;string, T&gt;                                                   | the relationship of the target object to the link object (e.g. "noopener") |
| `type?`     | ConstantAccessor&lt;string, T&gt;                                                   | the link target mime type, e.g. "text/csv"                                 |
| `target?`   | ConstantAccessor&lt;'\_self' \| '\_blank' \| '\_parent' \| '\_top' \| string, T&gt; | the target of the link, e.g. "\_blank" or "\_self"                         |
| `download?` | ConstantAccessor&lt;boolean, T&gt;                                                  | if set to true, the link will be downloaded instead of navigating to it    |

### BaseRectMarkProps

| Prop            | Type                                    | Description                                                                |
| --------------- | --------------------------------------- | -------------------------------------------------------------------------- |
| `inset?`        | ConstantAccessor&lt;number, T&gt;       | shorthand to inset the rectangle on all sides, in pixels                   |
| `insetLeft?`    | ConstantAccessor&lt;number, T&gt;       | inset the rectangle from the left edge, in pixels                          |
| `insetTop?`     | ConstantAccessor&lt;number, T&gt;       | inset the rectangle from the top edge, in pixels                           |
| `insetRight?`   | ConstantAccessor&lt;number, T&gt;       | inset the rectangle from the right edge, in pixels                         |
| `insetBottom?`  | ConstantAccessor&lt;number, T&gt;       | inset the rectangle from the bottom edge, in pixels                        |
| `borderRadius?` | ConstantAccessor&lt;BorderRadius, T&gt; | the border radius of the rectangle; can be a number or a per-corner object |

## Type details

### CurveName

- `basis`
- `basis-closed`
- `basis-open`
- `bundle`
- `bump-x`
- `bump-y`
- `cardinal`
- `cardinal-closed`
- `cardinal-open`
- `catmull-rom`
- `catmull-rom-closed`
- `catmull-rom-open`
- `linear`
- `linear-closed`
- `monotone-x`
- `monotone-y`
- `natural`
- `step`
- `step-after`
- `step-before`

### StackOptions

```ts
export type StackOptions =
    | {
          offset: null | StackOffset;
          order: null | StackOrder;
          reverse: boolean;
      }
    | false;
```

### DodgeXOptions

```ts
export type DodgeXOptions =
    | AnchorX
    | (BaseDodgeOptions & {
          anchor?: 'left' | 'right' | 'middle';
      });
```

### DodgeYOptions

```ts
export type DodgeYOptions =
    | AnchorY
    | (BaseDodgeOptions & {
          anchor?: 'top' | 'bottom' | 'middle';
      });
```

### MarkerShape

- `dot`
- `circle`
- `circle-stroke`
- `arrow`
- `arrow-reverse`
- `tick`
- `tick-x`
- `tick-y`
