---
title: Scale types
---

SveltePlot infers the **type** of each scale from the values it receives across all marks. The `Date` column in our AAPL data contains date strings, so SveltePlot picks a **temporal** (time-based) x scale automatically.

Let's add a vertical reference line at the start of 2016. Import `RuleX` and add it to the plot:

```svelte
import { Plot, Line, +++RuleX+++ } from 'svelteplot';
```

Let's add a rule at `2016`:

```svelte
<Plot>
+  <RuleX x={2016} stroke="red" />
</Plot
```

But what happened? The line is nowhere near 2016, and the axis labels turned into numbers! The `Plot` component infers the scale type from the data it receives. The `Line` mark receives `Date` objects, but the `RuleX` we added received a number. When SveltePlot sees a mix of data types, it falls back to a linear scale, which treats dates as Unix timestamps (milliseconds since 1970) and plots `2016` as a tiny value near zero.

To fix this we can pass a `Date` object to `RuleX` instead of a number:

```svelte
<Plot>
  <Line {data} x="Date" y="Close" />
  <RuleX +++x={new Date('2016-01-01')}+++ stroke="red" />
</Plot>
```
