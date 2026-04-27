---
title: Scatterplot
---

So far we've been plotting a time series. Let's switch to a different dataset and a different mark. We'll use `polls.csv` — German polling data with columns `date`, `party`, and `value` — and draw it as a scatterplot.

First, import the data and the `Dot` mark:

```svelte
<script>
  import { Plot+++, Dot+++ } from 'svelteplot';
  +++import data from './polls.csv';+++
</script>
```

Then replace the placeholder comment with a `<Dot>` mark:

```svelte
<Plot>
-  <!-- add marks -->
+  <Dot
+    {data}
+    x="date"
+    y="value"
+    fill="party" />
</Plot>
```

The `fill="party"` channel tells SveltePlot to color each dot by the `party` column. SveltePlot picks a color scheme automatically.
