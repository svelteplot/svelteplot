---
title: Marks API reference
---

## Area

Creates an area chart with filled regions between two x-y value pairs

| Prop         | Type                                                                                   | Description |
| ------------ | -------------------------------------------------------------------------------------- | ----------- |
| `data`       | Datum[]                                                                                |             |
| `x1?`        | ChannelAccessor&lt;Datum&gt;                                                           |             |
| `x2?`        | ChannelAccessor&lt;Datum&gt;                                                           |             |
| `y1?`        | ChannelAccessor&lt;Datum&gt;                                                           |             |
| `y2?`        | ChannelAccessor&lt;Datum&gt;                                                           |             |
| `z?`         | ChannelAccessor&lt;Datum&gt;                                                           |             |
| `curve?`     | [CurveName](/api/marks#CurveName) \| CurveFactory                                      |             |
| `tension?`   | number                                                                                 |             |
| `sort?`      | ConstantAccessor&lt;RawValue&gt; \| &amp;#123; channel: 'stroke' \| 'fill'; &amp;#125; |             |
| `stack?`     | Partial&lt;[StackOptions](/api/marks#StackOptions)&gt;                                 |             |
| `canvas?`    | boolean                                                                                |             |
| `areaClass?` | ConstantAccessor&lt;string, Datum&gt;                                                  |             |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [LinkableMarkProps](/api/marks#LinkableMarkProps).

## AreaX

Creates a horizontal area chart with x value and baseline. Areas are implicitly stacked horizontally if just the x channel is defined.

| Prop | Type                         | Description |
| ---- | ---------------------------- | ----------- |
| `x?` | ChannelAccessor&lt;Datum&gt; |             |
| `y?` | ChannelAccessor&lt;Datum&gt; |             |

Inherited props from [Area](/api/marks#Area).

## AreaY

Creates a vertical area chart with y value and baseline. Areas are implicitly stacked vertically if just the y channel is defined.

| Prop | Type                         | Description |
| ---- | ---------------------------- | ----------- |
| `x?` | ChannelAccessor&lt;Datum&gt; |             |
| `y?` | ChannelAccessor&lt;Datum&gt; |             |

Inherited props from [Area](/api/marks#Area).

## Arrow

Creates arrows with customizable heads, angles, and bending

| Prop          | Type                                                                                                                   | Description                                                         |
| ------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `data`        | Datum[]                                                                                                                |                                                                     |
| `sort?`       | ConstantAccessor&lt;RawValue&gt; \| &amp;#123; channel: 'stroke' \| 'fill' \| 'x1' \| 'y1' \| 'x2' \| 'y2'; &amp;#125; |                                                                     |
| `x1`          | ChannelAccessor&lt;Datum&gt;                                                                                           |                                                                     |
| `y1`          | ChannelAccessor&lt;Datum&gt;                                                                                           |                                                                     |
| `x2`          | ChannelAccessor&lt;Datum&gt;                                                                                           |                                                                     |
| `y2`          | ChannelAccessor&lt;Datum&gt;                                                                                           |                                                                     |
| `bend?`       | ConstantAccessor&lt;number, Datum&gt; \| true                                                                          | the bend angle, in degrees; defaults to 0°; true for 22.5°          |
| `headAngle?`  | ConstantAccessor&lt;number, Datum&gt;                                                                                  | the arrowhead angle, in degrees; defaults to 60°                    |
| `headLength?` | ConstantAccessor&lt;number, Datum&gt;                                                                                  | the arrowhead scale; defaults to 8                                  |
| `insetEnd?`   | ConstantAccessor&lt;number, Datum&gt;                                                                                  | inset at the end of the arrow (useful if the arrow points to a dot) |
| `insetStart?` | ConstantAccessor&lt;number, Datum&gt;                                                                                  | inset at the start of the arrow                                     |
| `inset?`      | ConstantAccessor&lt;number, Datum&gt;                                                                                  | shorthand for the two insets                                        |
| `sweep?`      | SweepOption                                                                                                            |                                                                     |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## AxisX

Renders a horizontal axis with labels and tick marks

| Prop                    | Type                                                                                                        | Description                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `data?`                 | Datum[]                                                                                                     |                                                               |
| `automatic?`            | boolean                                                                                                     |                                                               |
| `title?`                | string \| false \| null                                                                                     |                                                               |
| `anchor?`               | 'top' \| 'bottom'                                                                                           |                                                               |
| `interval?`             | string \| number                                                                                            |                                                               |
| `facetAnchor?`          | 'auto' \| 'top-empty' \| 'bottom-empty' \| 'top' \| 'bottom'                                                |                                                               |
| `labelAnchor?`          | 'auto' \| 'left' \| 'center' \| 'right'                                                                     |                                                               |
| `tickSize?`             | number                                                                                                      |                                                               |
| `tickFontSize?`         | ConstantAccessor&lt;number, Datum&gt;                                                                       |                                                               |
| `titleFontSize?`        | number                                                                                                      |                                                               |
| `tickPadding?`          | number                                                                                                      |                                                               |
| `tickFormat?`           | 'auto' \| Intl.DateTimeFormatOptions \| Intl.NumberFormatOptions \| ((d: RawValue, i: number) =&gt; string) |                                                               |
| `tickClass?`            | ConstantAccessor&lt;string, Datum&gt;                                                                       |                                                               |
| `ticks?`                | number \| string \| Datum[]                                                                                 | ticks is a shorthand for defining data, tickCount or interval |
| `text?`                 | boolean \| null                                                                                             | set to false or null to disable tick labels                   |
| `tickCount?`            | number                                                                                                      | approximate number of ticks to be generated                   |
| `tickSpacing?`          | number                                                                                                      | approximate number of pixels between generated ticks          |
| `textAnchor?`           | ConstantAccessor&lt;CSS.Property.TextAnchor \| 'auto', Datum&gt;                                            | text anchor for axis labels                                   |
| `removeDuplicateTicks?` | boolean                                                                                                     | you can set this to true to remove duplicate tick labels      |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## AxisY

Renders a vertical axis with labels and tick marks

| Prop             | Type                                                                                             | Description                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| `data?`          | Datum[]                                                                                          |                                                               |
| `automatic?`     | boolean                                                                                          |                                                               |
| `title?`         | string \| false \| null                                                                          |                                                               |
| `anchor?`        | 'left' \| 'right'                                                                                |                                                               |
| `facetAnchor?`   | 'auto' \| 'left' \| 'right' \| 'left-empty' \| 'right-empty'                                     |                                                               |
| `lineAnchor?`    | 'top' \| 'center' \| 'bottom'                                                                    |                                                               |
| `interval?`      | string \| number                                                                                 |                                                               |
| `labelAnchor?`   | 'auto' \| 'left' \| 'center' \| 'right'                                                          |                                                               |
| `textAnchor?`    | 'auto' \| 'start' \| 'middle' \| 'end'                                                           |                                                               |
| `tickSize?`      | number                                                                                           |                                                               |
| `tickFontSize?`  | ConstantAccessor&lt;number, Datum&gt;                                                            |                                                               |
| `titleFontSize?` | number                                                                                           |                                                               |
| `tickPadding?`   | number                                                                                           |                                                               |
| `tickFormat?`    | 'auto' \| Intl.DateTimeFormatOptions \| Intl.NumberFormatOptions \| ((d: RawValue) =&gt; string) |                                                               |
| `tickClass?`     | ConstantAccessor&lt;string, Datum&gt;                                                            |                                                               |
| `ticks?`         | number \| string \| Datum[]                                                                      | ticks is a shorthand for defining data, tickCount or interval |
| `text?`          | boolean \| null                                                                                  | set to false or null to disable tick labels                   |
| `tickCount?`     | number                                                                                           | approximate number of ticks to be generated                   |
| `tickSpacing?`   | number                                                                                           | approximate number of pixels between generated ticks          |

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
| `interval?` | number \| string                        | Converts y into y1/y2 ranges based on the provided interval. Disables the<br>implicit stacking |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [LinkableMarkProps](/api/marks#LinkableMarkProps), [BaseRectMarkProps](/api/marks#BaseRectMarkProps).

## BollingerX

line representing a moving average and an area representing volatility as a band

| Prop   | Type                         | Description                                                                             |
| ------ | ---------------------------- | --------------------------------------------------------------------------------------- |
| `data` | Datum[]                      |                                                                                         |
| `x?`   | ChannelAccessor&lt;Datum&gt; |                                                                                         |
| `y?`   | ChannelAccessor&lt;Datum&gt; |                                                                                         |
| `n?`   | number                       | the window size (the window transform's k option), an integer; defaults to 20           |
| `k?`   | number                       | the band radius, a number representing a multiple of standard deviations; defaults to 2 |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## BollingerY

line representing a moving average and an area representing volatility as a band

| Prop   | Type                         | Description                                                                             |
| ------ | ---------------------------- | --------------------------------------------------------------------------------------- |
| `data` | Datum[]                      |                                                                                         |
| `x?`   | ChannelAccessor&lt;Datum&gt; |                                                                                         |
| `y?`   | ChannelAccessor&lt;Datum&gt; |                                                                                         |
| `n?`   | number                       | the window size (the window transform's k option), an integer; defaults to 20           |
| `k?`   | number                       | the band radius, a number representing a multiple of standard deviations; defaults to 2 |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## BoxX

Creates a horizontal box plot for visualizing data distribution with quartiles and outliers

_No props found._

Inherited props from [BoxY](/api/marks#BoxY).

## BoxY

Creates a vertical box plot for visualizing data distribution with quartiles and outliers

| Prop         | Type                                                                                                                             | Description                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `data`       | Datum[]                                                                                                                          |                                                             |
| `x`          | ChannelAccessor                                                                                                                  |                                                             |
| `y`          | ChannelAccessor                                                                                                                  |                                                             |
| `sort?`      | 'min' \| 'max' \| 'median' \| 'p25' \| 'p75' \| '-min' \| '-max' \| '-median' \| '-p25' \| '-p75' \| ((d: Datum) =&gt; RawValue) | Custom sort order for grouped box plot data                 |
| `rule`       | Record&lt;string, ChannelAccessor&lt;Datum&gt;&gt;                                                                               | Options for the rule marks that represent the min/max range |
| `bar`        | Record&lt;string, ChannelAccessor&lt;Datum&gt;&gt;                                                                               | Options for the bar marks that represent the IQR range      |
| `tickMedian` | Record&lt;string, ChannelAccessor&lt;Datum&gt;&gt; \| boolean                                                                    | Options for the tick marks that represent the median        |
| `tickMinMax` | Record&lt;string, ChannelAccessor&lt;Datum&gt;&gt; \| boolean                                                                    | Options for the tick marks that represent the min/max range |
| `dot`        | Record&lt;string, ChannelAccessor&lt;Datum&gt;&gt;                                                                               | Options for the dot marks that represent the outliers       |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## Brush

For creating a two-dimensional brush selection

| Prop                 | Type                         | Description                                                                      |
| -------------------- | ---------------------------- | -------------------------------------------------------------------------------- |
| `brush`              | Brush                        |                                                                                  |
| `limitDimension?`    | false \| 'x' \| 'y'          | limit brushing to x or y dimension                                               |
| `constrainToDomain?` | boolean                      | whether brush can move/resize outside domain                                     |
| `resizeHandleSize?`  | number                       | size of the (invisible) drag resize area around the edges of the brush selection |
| `onbrushstart?`      | (evt: BrushEvent) =&gt; void |                                                                                  |
| `onbrushend?`        | (evt: BrushEvent) =&gt; void |                                                                                  |
| `onbrush?`           | (evt: BrushEvent) =&gt; void |                                                                                  |

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

| Prop   | Type                         | Description |
| ------ | ---------------------------- | ----------- |
| `data` | Datum[]                      |             |
| `x?`   | ChannelAccessor&lt;Datum&gt; |             |
| `y?`   | ChannelAccessor&lt;Datum&gt; |             |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [LinkableMarkProps](/api/marks#LinkableMarkProps), [BaseRectMarkProps](/api/marks#BaseRectMarkProps).

## CellX

For arbitrary rectangles with fixed y position, requires band x scale

| Prop   | Type    | Description |
| ------ | ------- | ----------- |
| `data` | Datum[] |             |

Inherited props from [Cell](/api/marks#Cell).

## CellY

For arbitrary rectangles with fixed x position, requires band y scale

| Prop   | Type    | Description |
| ------ | ------- | ----------- |
| `data` | Datum[] |             |

Inherited props from [Cell](/api/marks#Cell).

## ColorLegend

The ColorLegend is an HTML mark that can be placed in the header, footer and overlay snippets. You can activate an implicit ColorLegend above the chart using the global color.legend scale option.

| Prop    | Type           | Description |
| ------- | -------------- | ----------- |
| `class` | string \| null |             |

Inherited props: see the [shared section](/api/marks#Inherited-props) below.

## DifferenceY

| Prop                   | Type                                              | Description                                                   |
| ---------------------- | ------------------------------------------------- | ------------------------------------------------------------- |
| `data`                 | Datum[]                                           |                                                               |
| `x1`                   | ChannelAccessor&lt;Datum&gt;                      |                                                               |
| `x2`                   | ChannelAccessor&lt;Datum&gt;                      | the horizontal position of the metric; bound to the x scale   |
| `x`                    | ChannelAccessor&lt;Datum&gt;                      |                                                               |
| `y1`                   | ChannelAccessor&lt;Datum&gt;                      | the vertical position of the comparison; bound to the y scale |
| `y2`                   | ChannelAccessor&lt;Datum&gt;                      | the vertical position of the metric; bound to the y scale     |
| `y`                    | ChannelAccessor&lt;Datum&gt;                      |                                                               |
| `fillOpacity?`         | number                                            |                                                               |
| `positiveFill?`        | string                                            | the stroke color of the "positive" area; defaults to 'blue'   |
| `positiveFillOpacity?` | number                                            | the fill opacity of the "positive" area; defaults to 1        |
| `negativeFill?`        | string                                            | the stroke color of the "negative" area; defaults to 'red'    |
| `negativeFillOpacity?` | number                                            | the fill opacity of the "negative" area; defaults to 1        |
| `curve?`               | [CurveName](/api/marks#CurveName) \| CurveFactory | curve type for the area; defaults to 'linear'                 |
| `tension?`             | number                                            | the tension of the area curve; defaults to 0                  |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## Dot

Creates dots or symbols at specified positions with customizable size and appearance

| Prop        | Type                                                              | Description |
| ----------- | ----------------------------------------------------------------- | ----------- |
| `data`      | Datum[]                                                           |             |
| `x`         | ChannelAccessor&lt;Datum&gt;                                      |             |
| `y`         | ChannelAccessor&lt;Datum&gt;                                      |             |
| `r?`        | ChannelAccessor&lt;Datum&gt;                                      |             |
| `symbol?`   | ChannelAccessor&lt;Datum&gt; \| Snippet&lt;[ number, string ]&gt; |             |
| `canvas?`   | boolean                                                           |             |
| `dotClass?` | ConstantAccessor&lt;string, Datum&gt;                             |             |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [LinkableMarkProps](/api/marks#LinkableMarkProps).

## DotX

Creates a horizontal dot plot with x values along a single y position

| Prop   | Type                         | Description |
| ------ | ---------------------------- | ----------- |
| `data` | Datum[]                      |             |
| `x?`   | ChannelAccessor&lt;Datum&gt; |             |

Inherited props from [Dot](/api/marks#Dot).

## DotY

Creates a horizontal dot plot with x values along a single y position

| Prop   | Type    | Description |
| ------ | ------- | ----------- |
| `data` | Datum[] |             |

Inherited props from [Dot](/api/marks#Dot).

## Frame

Renders a simple frame around the entire plot domain

| Prop             | Type    | Description |
| ---------------- | ------- | ----------- |
| `fill?`          | string  |             |
| `stroke?`        | string  |             |
| `fillOpacity?`   | number  |             |
| `strokeOpacity?` | number  |             |
| `opacity?`       | number  |             |
| `automatic?`     | boolean |             |
| `inset?`         | number  |             |
| `insetLeft?`     | number  |             |
| `insetRight?`    | number  |             |
| `insetTop?`      | number  |             |
| `insetBottom?`   | number  |             |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [BaseRectMarkProps](/api/marks#BaseRectMarkProps), [LinkableMarkProps](/api/marks#LinkableMarkProps).

## Geo

Renders geographical data using projections and GeoJSON geometries

| Prop          | Type                                               | Description                                         |
| ------------- | -------------------------------------------------- | --------------------------------------------------- |
| `data?`       | Datum[] \| &amp;#123; type: 'Sphere'; &amp;#125;[] |                                                     |
| `geoType?`    | 'sphere' \| 'graticule'                            |                                                     |
| `dragRotate?` | boolean                                            | todo: implement?                                    |
| `canvas?`     | boolean                                            | toggle canvas rendering mode                        |
| `title?`      | ConstantAccessor&lt;string, Datum&gt;              | simple browser tooltip to be displayed on mouseover |
| `r?`          | ChannelAccessor&lt;Datum&gt;                       | radius for point features                           |
| `svgFilter?`  | ConstantAccessor&lt;string \| undefined, Datum&gt; |                                                     |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [LinkableMarkProps](/api/marks#LinkableMarkProps).

## Graticule

Renders a geographic graticule grid with customizable step sizes

| Prop     | Type   | Description |
| -------- | ------ | ----------- |
| `step?`  | number |             |
| `stepX?` | number |             |
| `stepY?` | number |             |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## GridX

Renders vertical gridlines at x-axis tick positions

| Prop         | Type                         | Description |
| ------------ | ---------------------------- | ----------- |
| `data?`      | Datum[]                      |             |
| `automatic?` | boolean                      |             |
| `y1?`        | ChannelAccessor&lt;Datum&gt; |             |
| `y2?`        | ChannelAccessor&lt;Datum&gt; |             |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## GridY

Renders horizontal gridlines at y-axis tick positions

| Prop         | Type                         | Description |
| ------------ | ---------------------------- | ----------- |
| `data?`      | Datum[]                      |             |
| `automatic?` | boolean                      |             |
| `x1?`        | ChannelAccessor&lt;Datum&gt; |             |
| `x2?`        | ChannelAccessor&lt;Datum&gt; |             |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## HTMLTooltip

For showing custom HTML tooltips positioned at x/y coordinates

| Prop       | Type                                                   | Description |
| ---------- | ------------------------------------------------------ | ----------- |
| `data`     | Datum[]                                                |             |
| `x?`       | ChannelAccessor&lt;Datum&gt;                           |             |
| `y?`       | ChannelAccessor&lt;Datum&gt;                           |             |
| `r?`       | ChannelAccessor&lt;Datum&gt;                           |             |
| `fx?`      | ChannelAccessor&lt;Datum&gt;                           |             |
| `fy?`      | ChannelAccessor&lt;Datum&gt;                           |             |
| `children` | Snippet&lt;[ &amp;#123; datum: Datum; &amp;#125; ]&gt; |             |

Inherited props: see the [shared section](/api/marks#Inherited-props) below.

## Image

For showing images positioned at x/y coordinates

| Prop                   | Type                                  | Description |
| ---------------------- | ------------------------------------- | ----------- |
| `data`                 | Datum[]                               |             |
| `x`                    | ChannelAccessor&lt;Datum&gt;          |             |
| `y`                    | ChannelAccessor&lt;Datum&gt;          |             |
| `r?`                   | ChannelAccessor&lt;Datum&gt;          |             |
| `width?`               | ConstantAccessor&lt;number, Datum&gt; |             |
| `height?`              | ConstantAccessor&lt;number, Datum&gt; |             |
| `src?`                 | ConstantAccessor&lt;string, Datum&gt; |             |
| `title?`               | ConstantAccessor&lt;string, Datum&gt; |             |
| `preserveAspectRatio?` | string                                |             |
| `imageClass?`          | ConstantAccessor&lt;string, Datum&gt; |             |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [LinkableMarkProps](/api/marks#LinkableMarkProps).

## Line

Creates line charts with connecting points in a dataset with customizable curves and markers

| Prop                    | Type                                                                                          | Description |
| ----------------------- | --------------------------------------------------------------------------------------------- | ----------- |
| `data?`                 | Datum[]                                                                                       |             |
| `x?`                    | ChannelAccessor&lt;Datum&gt;                                                                  |             |
| `y?`                    | ChannelAccessor&lt;Datum&gt;                                                                  |             |
| `z?`                    | ChannelAccessor&lt;Datum&gt;                                                                  |             |
| `outlineStroke?`        | string                                                                                        |             |
| `outlineStrokeWidth?`   | number                                                                                        |             |
| `outlineStrokeOpacity?` | number                                                                                        |             |
| `curve?`                | [CurveName](/api/marks#CurveName) \| CurveFactory \| 'auto'                                   |             |
| `tension?`              | number                                                                                        |             |
| `sort?`                 | ConstantAccessor&lt;RawValue, Datum&gt; \| &amp;#123; channel: 'stroke' \| 'fill'; &amp;#125; |             |
| `text?`                 | ConstantAccessor&lt;string, Datum&gt;                                                         |             |
| `textFill?`             | ConstantAccessor&lt;string, Datum&gt;                                                         |             |
| `textStroke?`           | ConstantAccessor&lt;string, Datum&gt;                                                         |             |
| `textStartOffset?`      | ConstantAccessor&lt;string, Datum&gt;                                                         |             |
| `textStrokeWidth?`      | ConstantAccessor&lt;number, Datum&gt;                                                         |             |
| `lineClass?`            | ConstantAccessor&lt;string, Datum&gt;                                                         |             |
| `canvas?`               | boolean                                                                                       |             |

Inherited props from [MarkerOptions](/api/marks#MarkerOptions), [BaseMarkProps](/api/marks#BaseMarkProps).

## LineX

Creates a horizontal line chart with x values and index positions for y

| Prop   | Type    | Description |
| ------ | ------- | ----------- |
| `data` | Datum[] |             |

Inherited props from [Line](/api/marks#Line).

## LineY

Creates a horizontal line chart with x values and index positions for y

| Prop   | Type    | Description |
| ------ | ------- | ----------- |
| `data` | Datum[] |             |

Inherited props from [Line](/api/marks#Line).

## Link

Creates connections between pairs of points with optional curve styling and markers

| Prop       | Type                                                                                   | Description                                                                                                                            |
| ---------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `data`     | Datum[]                                                                                |                                                                                                                                        |
| `sort?`    | ConstantAccessor&lt;RawValue&gt; \| &amp;#123; channel: 'stroke' \| 'fill'; &amp;#125; |                                                                                                                                        |
| `x1`       | ChannelAccessor&lt;Datum&gt;                                                           | the x1 channel accessor for the start of the link                                                                                      |
| `y1`       | ChannelAccessor&lt;Datum&gt;                                                           | the y1 channel accessor for the start of the link                                                                                      |
| `x2`       | ChannelAccessor&lt;Datum&gt;                                                           | the x2 channel accessor for the end of the link                                                                                        |
| `y2`       | ChannelAccessor&lt;Datum&gt;                                                           |                                                                                                                                        |
| `curve?`   | 'auto' \| [CurveName](/api/marks#CurveName) \| CurveFactory                            | the curve type, defaults to 'auto' which uses a linear curve for planar projections<br>and a spherical line for geographic projections |
| `tension?` | number                                                                                 | the tension of the curve, defaults to 0                                                                                                |
| `text?`    | ConstantAccessor&lt;string, Datum&gt;                                                  | the text label for the link, can be a constant or a function                                                                           |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [MarkerOptions](/api/marks#MarkerOptions).

## Pointer

| Prop           | Type                                                    | Description                                                                                      |
| -------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `data`         | Datum[]                                                 |                                                                                                  |
| `children?`    | Snippet&lt;[ &amp;#123; data: Datum[]; &amp;#125; ]&gt; |                                                                                                  |
| `x?`           | ChannelAccessor&lt;Datum&gt;                            |                                                                                                  |
| `y?`           | ChannelAccessor&lt;Datum&gt;                            |                                                                                                  |
| `z?`           | ChannelAccessor&lt;Datum&gt;                            |                                                                                                  |
| `fx?`          | ChannelAccessor&lt;Datum&gt;                            |                                                                                                  |
| `fy?`          | ChannelAccessor&lt;Datum&gt;                            |                                                                                                  |
| `maxDistance?` | number                                                  | maximum cursor distance to select data points                                                    |
| `tolerance?`   | number                                                  | tolerance for considering points as "the same" when sharing x or y values<br>defaults to 0 pixel |
| `onupdate?`    | (data: Datum[]) =&gt; void                              | called whenever the selection changes                                                            |

Inherited props: see the [shared section](/api/marks#Inherited-props) below.

## Rect

For arbitrary rectangles, requires quantitative x and y scales

| Prop         | Type                         | Description |
| ------------ | ---------------------------- | ----------- |
| `data`       | Datum[]                      |             |
| `x?`         | ChannelAccessor&lt;Datum&gt; |             |
| `x1?`        | ChannelAccessor&lt;Datum&gt; |             |
| `x2?`        | ChannelAccessor&lt;Datum&gt; |             |
| `y?`         | ChannelAccessor&lt;Datum&gt; |             |
| `y1?`        | ChannelAccessor&lt;Datum&gt; |             |
| `y2?`        | ChannelAccessor&lt;Datum&gt; |             |
| `interval?`  | number \| string             |             |
| `className?` | string                       |             |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [LinkableMarkProps](/api/marks#LinkableMarkProps), [BaseRectMarkProps](/api/marks#BaseRectMarkProps).

## RectX

Convenience wrapper for rectangles oriented along the x axis

| Prop     | Type                                                   | Description |
| -------- | ------------------------------------------------------ | ----------- |
| `stack?` | Partial&lt;[StackOptions](/api/marks#StackOptions)&gt; |             |

Inherited props from [Rect](/api/marks#Rect).

## RectY

Convenience wrapper for rectangles oriented along the x axis

| Prop     | Type                                                   | Description |
| -------- | ------------------------------------------------------ | ----------- |
| `stack?` | Partial&lt;[StackOptions](/api/marks#StackOptions)&gt; |             |

Inherited props from [Rect](/api/marks#Rect).

## RuleX

Renders vertical rule lines at specified x positions with customizable vertical range

| Prop           | Type                                  | Description |
| -------------- | ------------------------------------- | ----------- |
| `data?`        | Datum[]                               |             |
| `x?`           | ChannelAccessor&lt;Datum&gt;          |             |
| `y1?`          | ChannelAccessor&lt;Datum&gt;          |             |
| `y2?`          | ChannelAccessor&lt;Datum&gt;          |             |
| `inset?`       | ConstantAccessor&lt;number, Datum&gt; |             |
| `insetTop?`    | ConstantAccessor&lt;number, Datum&gt; |             |
| `insetBottom?` | ConstantAccessor&lt;number, Datum&gt; |             |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## RuleY

Renders horizontal rule lines at specified y positions with customizable horizontal range

| Prop          | Type                                  | Description |
| ------------- | ------------------------------------- | ----------- |
| `data?`       | Datum[]                               |             |
| `y?`          | ChannelAccessor&lt;Datum&gt;          |             |
| `x1?`         | ChannelAccessor&lt;Datum&gt;          |             |
| `x2?`         | ChannelAccessor&lt;Datum&gt;          |             |
| `inset?`      | ConstantAccessor&lt;number, Datum&gt; |             |
| `insetLeft?`  | ConstantAccessor&lt;number, Datum&gt; |             |
| `insetRight?` | ConstantAccessor&lt;number, Datum&gt; |             |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## Sphere

Geo mark with Sphere geometry object

_No props found._

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [LinkableMarkProps](/api/marks#LinkableMarkProps).

## Spike

Wrapper around the vector mark with presets suitable for spike maps

| Prop      | Type                         | Description |
| --------- | ---------------------------- | ----------- |
| `data`    | Datum[]                      |             |
| `x`       | ChannelAccessor&lt;Datum&gt; |             |
| `y`       | ChannelAccessor&lt;Datum&gt; |             |
| `r?`      | number                       |             |
| `length?` | ChannelAccessor&lt;Datum&gt; |             |
| `rotate?` | ChannelAccessor&lt;Datum&gt; |             |

Inherited props: see the [shared section](/api/marks#Inherited-props) below.

## Text

Useful for adding SVG text labels to your plot.

| Prop              | Type                                                                                                                                              | Description                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `data?`           | Datum[]                                                                                                                                           |                                                               |
| `x?`              | ChannelAccessor&lt;Datum&gt;                                                                                                                      |                                                               |
| `y?`              | ChannelAccessor&lt;Datum&gt;                                                                                                                      |                                                               |
| `children?`       | Snippet                                                                                                                                           |                                                               |
| `text`            | ConstantAccessor&lt;string \| null \| false \| undefined, Datum&gt;                                                                               |                                                               |
| `title?`          | ConstantAccessor&lt;string, Datum&gt;                                                                                                             |                                                               |
| `fontFamily?`     | ConstantAccessor&lt;CSS.Property.FontFamily, Datum&gt;                                                                                            | the font size of the text                                     |
| `fontSize?`       | ConstantAccessor&lt;CSS.Property.FontSize \| number, Datum&gt;                                                                                    |                                                               |
| `fontWeight?`     | ConstantAccessor&lt;CSS.Property.FontWeight, Datum&gt;                                                                                            |                                                               |
| `fontStyle?`      | ConstantAccessor&lt;CSS.Property.FontStyle, Datum&gt;                                                                                             |                                                               |
| `fontVariant?`    | ConstantAccessor&lt;CSS.Property.FontVariant, Datum&gt;                                                                                           |                                                               |
| `letterSpacing?`  | ConstantAccessor&lt;CSS.Property.LetterSpacing, Datum&gt;                                                                                         |                                                               |
| `wordSpacing?`    | ConstantAccessor&lt;CSS.Property.WordSpacing, Datum&gt;                                                                                           |                                                               |
| `textTransform?`  | ConstantAccessor&lt;CSS.Property.TextTransform, Datum&gt;                                                                                         |                                                               |
| `textDecoration?` | ConstantAccessor&lt;CSS.Property.TextDecoration, Datum&gt;                                                                                        |                                                               |
| `textAnchor?`     | ConstantAccessor&lt;CSS.Property.TextAnchor, Datum&gt;                                                                                            | the horizontal text anchor; start, end, or middle             |
| `textClass?`      | ConstantAccessor&lt;string, Datum&gt;                                                                                                             | if you want to apply class names to individual text elements  |
| `lineAnchor?`     | ConstantAccessor&lt;'bottom' \| 'top' \| 'middle'&gt;                                                                                             | the line anchor for vertical position; top, bottom, or middle |
| `lineHeight?`     | ConstantAccessor&lt;number, Datum&gt;                                                                                                             | line height as multiplier of font size                        |
| `frameAnchor?`    | ConstantAccessor&lt;'bottom' \| 'top' \| 'left' \| 'right' \| 'top-left' \| 'bottom-left' \| 'top-right' \| 'bottom-right' \| 'middle', Datum&gt; |                                                               |
| `rotate?`         | ConstantAccessor&lt;number, Datum&gt;                                                                                                             | rotate text by angle in degrees                               |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [LinkableMarkProps](/api/marks#LinkableMarkProps).

## TickX

The TickX mark is useful for showing one-dimensional distributions along the x axis. The y axis must be a band scale.

| Prop          | Type                                  | Description                                                                                                                                                      |
| ------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`        | Datum[]                               |                                                                                                                                                                  |
| `x?`          | ChannelAccessor&lt;Datum&gt;          | the horizontal position; bound to the x scale                                                                                                                    |
| `y?`          | ChannelAccessor&lt;Datum&gt;          | the vertical position; bound to the y scale, which must be band. If the y channel<br>is not specified, the tick will span the full vertical extent of the frame. |
| `tickLength?` | ConstantAccessor&lt;number, Datum&gt; | if ticks are used on a non-bandwidth scale, this will determine the<br>length of the tick. Defaults to 10 pixel                                                  |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## TickY

The TickY mark is useful for showing one-dimensional distributions along the y axis. The x axis must be a band scale.

| Prop          | Type                                  | Description                                                                                                                                                        |
| ------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `data`        | Datum[]                               |                                                                                                                                                                    |
| `y?`          | ChannelAccessor&lt;Datum&gt;          | the vertical position; bound to the x scale                                                                                                                        |
| `x?`          | ChannelAccessor&lt;Datum&gt;          | the horizontal position; bound to the y scale, which must be band. If the y channel<br>is not specified, the tick will span the full vertical extent of the frame. |
| `tickLength?` | ConstantAccessor&lt;number, Datum&gt; | if ticks are used on a non-bandwidth scale, this will determine the<br>length of the tick. Defaults to 10 pixel                                                    |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## Trail

| Prop          | Type                                                                                          | Description                                 |
| ------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `data?`       | Datum[]                                                                                       |                                             |
| `x?`          | ChannelAccessor&lt;Datum&gt;                                                                  |                                             |
| `y?`          | ChannelAccessor&lt;Datum&gt;                                                                  |                                             |
| `z?`          | ChannelAccessor&lt;Datum&gt;                                                                  |                                             |
| `r?`          | ChannelAccessor&lt;Datum&gt;                                                                  |                                             |
| `curve?`      | [CurveName](/api/marks#CurveName) \| CurveFactory                                             |                                             |
| `tension?`    | number                                                                                        |                                             |
| `sort?`       | ConstantAccessor&lt;RawValue, Datum&gt; \| &amp;#123; channel: 'stroke' \| 'fill'; &amp;#125; |                                             |
| `defined?`    | ConstantAccessor&lt;boolean, Datum&gt;                                                        |                                             |
| `canvas?`     | boolean                                                                                       |                                             |
| `cap?`        | 'butt' \| 'round'                                                                             |                                             |
| `resolution?` | number \| 'auto'                                                                              | Samples per segment for curve interpolation |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps).

## WaffleX

The waffleX mark lets you create waffle charts by filling a rectangular area with small squares representing data values.

| Prop     | Type                                    | Description                   |
| -------- | --------------------------------------- | ----------------------------- |
| `data?`  | Datum[]                                 |                               |
| `x?`     | ChannelAccessor&lt;Datum&gt;            | bound to a quantitative scale |
| `x1?`    | ChannelAccessor&lt;Datum&gt;            | bound to a quantitative scale |
| `x2?`    | ChannelAccessor&lt;Datum&gt;            | bound to a quantitative scale |
| `y?`     | ChannelAccessor&lt;Datum&gt;            | bound to a band scale         |
| `stack?` | [StackOptions](/api/marks#StackOptions) |                               |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [LinkableMarkProps](/api/marks#LinkableMarkProps).

## WaffleY

The waffleX mark lets you create waffle charts by filling a rectangular area with small squares representing data values.

| Prop    | Type                         | Description                   |
| ------- | ---------------------------- | ----------------------------- |
| `data?` | Datum[]                      |                               |
| `x?`    | ChannelAccessor&lt;Datum&gt; | bound to a babd scale         |
| `y?`    | ChannelAccessor&lt;Datum&gt; | bound to a quantitative scale |
| `y1?`   | ChannelAccessor&lt;Datum&gt; | bound to a quantitative scale |
| `y2?`   | ChannelAccessor&lt;Datum&gt; | bound to a quantitative scale |

Inherited props from [BaseMarkProps](/api/marks#BaseMarkProps), [LinkableMarkProps](/api/marks#LinkableMarkProps).

## Inherited props

These props are shared by marks via the base type aliases.

### BaseMarkProps

| Prop               | Type                                                                                                                                                                      | Description                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `filter`           | ConstantAccessor&lt;boolean, T&gt;                                                                                                                                        | Filter the data without modifying the inferred scales       |
| `facet`            | 'auto' \| 'include' \| 'exclude'                                                                                                                                          |                                                             |
| `fx`               | ChannelAccessor&lt;T&gt;                                                                                                                                                  |                                                             |
| `fy`               | ChannelAccessor&lt;T&gt;                                                                                                                                                  |                                                             |
| `dx`               | ConstantAccessor&lt;number, T&gt;                                                                                                                                         |                                                             |
| `dy`               | ConstantAccessor&lt;number, T&gt;                                                                                                                                         |                                                             |
| `dodgeX`           | [DodgeXOptions](/api/marks#DodgeXOptions)                                                                                                                                 |                                                             |
| `dodgeY`           | [DodgeYOptions](/api/marks#DodgeYOptions)                                                                                                                                 |                                                             |
| `fill`             | ChannelAccessor&lt;T&gt;                                                                                                                                                  |                                                             |
| `fillOpacity`      | ConstantAccessor&lt;number, T&gt;                                                                                                                                         |                                                             |
| `sort`             | string \| ConstantAccessor&lt;RawValue, T&gt; \| ((a: RawValue, b: RawValue) =&gt; number) \| &amp;#123; channel: string; order?: 'ascending' \| 'descending'; &amp;#125; |                                                             |
| `stroke`           | ChannelAccessor&lt;T&gt;                                                                                                                                                  |                                                             |
| `strokeWidth`      | ConstantAccessor&lt;number, T&gt;                                                                                                                                         |                                                             |
| `strokeOpacity`    | ConstantAccessor&lt;number, T&gt;                                                                                                                                         |                                                             |
| `strokeLinejoin`   | ConstantAccessor&lt;CSS.Property.StrokeLinejoin, T&gt;                                                                                                                    |                                                             |
| `strokeLinecap`    | ConstantAccessor&lt;CSS.Property.StrokeLinecap, T&gt;                                                                                                                     |                                                             |
| `strokeMiterlimit` | ConstantAccessor&lt;number, T&gt;                                                                                                                                         |                                                             |
| `opacity`          | ChannelAccessor&lt;T&gt;                                                                                                                                                  |                                                             |
| `strokeDasharray`  | ConstantAccessor&lt;string, T&gt;                                                                                                                                         |                                                             |
| `strokeDashoffset` | ConstantAccessor&lt;number, T&gt;                                                                                                                                         |                                                             |
| `mixBlendMode`     | ConstantAccessor&lt;CSS.Property.MixBlendMode, T&gt;                                                                                                                      |                                                             |
| `clipPath`         | string                                                                                                                                                                    |                                                             |
| `mask`             | string                                                                                                                                                                    |                                                             |
| `imageFilter`      | ConstantAccessor&lt;string, T&gt;                                                                                                                                         |                                                             |
| `shapeRendering`   | ConstantAccessor&lt;CSS.Property.ShapeRendering, T&gt;                                                                                                                    |                                                             |
| `paintOrder`       | ConstantAccessor&lt;string, T&gt;                                                                                                                                         |                                                             |
| `onclick`          | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `ondblclick`       | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `onmouseup`        | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `onmousedown`      | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `onmouseenter`     | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `onmousemove`      | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `onmouseleave`     | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `onmouseout`       | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `onmouseover`      | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `onpointercancel`  | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `onpointerdown`    | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `onpointerup`      | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `onpointerenter`   | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `onpointerleave`   | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `onpointermove`    | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `onpointerover`    | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `onpointerout`     | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `ondrag`           | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `ondrop`           | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `ondragstart`      | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `ondragenter`      | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `ondragleave`      | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `ondragover`       | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `ondragend`        | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `ontouchstart`     | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `ontouchmove`      | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `ontouchend`       | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `ontouchcancel`    | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `oncontextmenu`    | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `onwheel`          | MouseEventHandler&lt;SVGPathElement&gt;                                                                                                                                   |                                                             |
| `class`            | string                                                                                                                                                                    | if you want to give your mark element an extra CSS class    |
| `style`            | string                                                                                                                                                                    | if you want to give your mark element an extra inline style |
| `cursor`           | ConstantAccessor&lt;CSS.Property.Cursor, T&gt;                                                                                                                            |                                                             |

### MarkerOptions

| Prop           | Type                                                        | Description                                             |
| -------------- | ----------------------------------------------------------- | ------------------------------------------------------- |
| `markerStart?` | boolean \| [MarkerShape](/api/marks#MarkerShape) \| Snippet | the marker for the starting point of a line segment     |
| `markerMid?`   | boolean \| [MarkerShape](/api/marks#MarkerShape) \| Snippet | the marker for any intermediate point of a line segment |
| `markerEnd?`   | boolean \| [MarkerShape](/api/marks#MarkerShape) \| Snippet | the marker for the end point of a line segment          |
| `marker?`      | boolean \| [MarkerShape](/api/marks#MarkerShape) \| Snippet | shorthand for setting the marker on all points          |

### LinkableMarkProps

| Prop        | Type                                                                                | Description                                                                |
| ----------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `href?`     | ConstantAccessor&lt;string, T&gt;                                                   | if set, the mark element will be wrapped in a &lt;a&gt; link element       |
| `rel?`      | ConstantAccessor&lt;string, T&gt;                                                   | the relationship of the target object to the link object (e.g. "noopener") |
| `type?`     | ConstantAccessor&lt;string, T&gt;                                                   | the link target mime type, e.g. "text/csv"                                 |
| `target?`   | ConstantAccessor&lt;'\_self' \| '\_blank' \| '\_parent' \| '\_top' \| string, T&gt; | the target of the link, e.g. "\_blank" or "\_self"                         |
| `download?` | ConstantAccessor&lt;boolean, T&gt;                                                  | if set to true, the link will be downloaded instead of navigating to it    |

### BaseRectMarkProps

| Prop            | Type                                    | Description |
| --------------- | --------------------------------------- | ----------- |
| `inset?`        | ConstantAccessor&lt;number, T&gt;       |             |
| `insetLeft?`    | ConstantAccessor&lt;number, T&gt;       |             |
| `insetTop?`     | ConstantAccessor&lt;number, T&gt;       |             |
| `insetRight?`   | ConstantAccessor&lt;number, T&gt;       |             |
| `insetBottom?`  | ConstantAccessor&lt;number, T&gt;       |             |
| `borderRadius?` | ConstantAccessor&lt;BorderRadius, T&gt; |             |

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
