---
title: Plot API reference
---

The Plot component is the container for plots. It collects the marks with their data and channels and computes the shared scales. The Plot component is split into two parts. This is the outer Plot which provides convenient defaults and automatically adds axes etc to the graphics. The downside is that it adds a bunch of imports that you may not be using. To help with this you can use the core/Plot component directly for a more low-level Plot wrapper.

| Prop | Type | Description |
| --- | --- | --- |
| `title` | string | The plot title, rendered as H2 tag above the SVG element. Instead of<br>using the title, you can also pass a "header" snippet and render your<br>own custom title markup. |
| `subtitle` | string | The plot subtitle, rendered as H3 tag above the SVG element. Instead of<br>using the subtitle, you can also pass a "header" snippet and render your<br>own custom title markup. |
| `caption` | string | The plot caption, rendered as FIGCAPTION tag below the SVG element. Instead of<br>using the caption, you can also pass a "footer" snippet and render your<br>own custom title markup. |
| `maxWidth?` | string | By default, the plot will extend to fit 100% of the parent container width. By<br>setting the maxWidth style property you can limit the width of your plot. |
| `width?` | number | force the plot into a fixed width |
| `height` | 'auto' \| number \| ((d: number) =&gt; number) | force the plot into a fixed height |
| `margin` | PlotMargin \| number \| 'auto' | If margin is set to "auto" (the default), the plot will automatically<br>compute appropriate margins based on the presence of axes, labels, and<br>the overall plot size. You can also set a fixed margin value in px. |
| `marginLeft` | number | Left margin of the plot, in px. |
| `marginRight` | number | Right margin of the plot, in px. |
| `marginTop` | number | Top margin of the plot, in px. |
| `marginBottom` | number | Bottom margin of the plot, in px. |
| `grid` | boolean | Activates the implicit GridX and GridY marks. |
| `axes` | boolean | Activates the implicit AxisX and AxisY marks. |
| `frame` | boolean | Activates the implicit frame marks |
| `inset` | number | Convenience shortcut for setting both the x and y scale insets. |
| `padding` | number | Convenience shortcut for setting both the x and y scale paddings |
| `projection` | string \| null \| &amp;#123; type?: string; rotate?: [ number, number ] \| [ number, number, number ]; domain?: object; inset?: number; clip?: Clip; &amp;#125; \| &amp;#123; type: (d: &amp;#123; width: number; height: number; &amp;#125;) =&gt; GeoProjection; &amp;#125; | Geo-projection |
| `aspectRatio` | number \| null | if not null, computes a default height such that a variation of one<br>unit in the x dimension is represented by the corresponding number<br>of pixels as a variation in the y dimension of one unit. |
| `facet` | Partial&lt;&amp;#123; data: DataRecord&lt;any&gt;[]; x: ChannelAccessor; y: ChannelAccessor; &amp;#125;&gt; | Top-level faceting options |
| `x` | Partial&lt;XScaleOptions&gt; \| false \| RawValue[] | Options for the shared x scale. |
| `y` | Partial&lt;YScaleOptions&gt; \| false \| RawValue[] | Options for the shared y scale |
| `r` | Partial&lt;ScaleOptions&gt; | Options for the shared radius scale |
| `color` | Partial&lt;ColorScaleOptions&gt; |  |
| `opacity` | Partial&lt;ScaleOptions&gt; |  |
| `symbol` | Partial&lt;LegendScaleOptions&gt; |  |
| `length` | Partial&lt;ScaleOptions&gt; |  |
| `fx` | Partial&lt;XScaleOptions&gt; \| false \| RawValue[] |  |
| `fy` | Partial&lt;YScaleOptions&gt; \| false \| RawValue[] |  |
| `children` | Snippet&lt;[ &amp;#123; width: number; height: number; options: PlotOptions; scales: PlotScales; &amp;#125; ]&gt; |  |
| `header` | Snippet | You can use the header snippet to render a custom title and subtitle for<br>your plot, or place a legend above the visualization. |
| `footer` | Snippet |  |
| `underlay` | Snippet&lt;[ PlotOptions ]&gt; | The underlay snippet is useful for adding a layer of custom HTML markup<br>behind the SVG body of your plot, e.g. for a watermark or background image. |
| `overlay` | Snippet&lt;[ &amp;#123; width: number; height: number; options: PlotOptions; scales: PlotScales; &amp;#125; ]&gt; | The overlay snippet is useful for adding a layer of custom HTML markup<br>in front of the SVG body of your plot, e.g. for HTML tooltips. |
| `facetAxes` | Snippet |  |
| `testid` | string | if you set testid, the plot container will get a data-testid attribute which<br>can be useful for automatic testing |
| `class` | string \| null | in case you want to give your Plot element an extra CSS class |
| `implicitScales` | boolean | if set to true, the plot will use the implicit scales |
| `locale` | string | locale used for automatic axis ticks |
| `css` | (d: string) =&gt; string \| undefined | pass a |
| `sortOrdinalDomains` | boolean | if set to true, ordinal domains will be sorted alphabetically |