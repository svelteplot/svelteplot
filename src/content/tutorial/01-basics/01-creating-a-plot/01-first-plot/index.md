---
title: The first plot
---

Let's create a SveltePlot to plot the data! The first thing we need to do is to import the `Plot` and `Line` component from svelteplot:

```svelte
<script>
  +++import { Plot, Line } from 'svelteplot';+++
  import data from './aapl.csv';
</script>
```

Then we can add a plot by adding these three lines to the markup:

```svelte
-<p>Loaded {data.length} rows of data</p>
+<Plot>
+  <Line {data} x="Date" y="Close" />
+</Plot>
```
