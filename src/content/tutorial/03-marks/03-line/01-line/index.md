---
title: The line mark
---

The `Line` mark draws a connected path through your data — typically a time series with a temporal x axis and a quantitative y axis.

```svelte
<script>
  +++import { Plot, Line } from 'svelteplot';+++
  import data from './aapl.csv';
</script>

-<p>Apple stock data: {data.length} rows</p>
+<Plot y={{ grid: true }}>
+  <Line {data} x="Date" y="Close" />
+</Plot>
```

SveltePlot renders axes automatically from the `x` and `y` channels. Try adding a `RuleY y={0}` baseline, or an `AreaY` below the line.
