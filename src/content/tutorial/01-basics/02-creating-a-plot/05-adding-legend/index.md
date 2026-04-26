---
title: Adding a legend
---

The dots are colored by party, but we have no idea which color represents which party. We can add one by passing a `color` option to `<Plot>`:

```svelte
-<Plot>
+<Plot color={{ legend: true }}>
  <Dot {data} x="date" y="value" fill="party" />
</Plot>
```

SveltePlot automatically generates a color legend from the `fill` channel and renders it above the plot.
