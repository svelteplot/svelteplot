---
title: Faceting
---

When two groups share the same axes, their marks can visually overlap and become hard to read. **Faceting** splits the plot into one small panel per group, each with its own x-axis, while keeping the y-axis shared so values stay comparable.

Add `fx="party"` to both marks to split them by party:

```svelte
/// file: App.svelte
<Dot
  {data}
  x="date"
  y="value"
  +++fx="party"
  +++
  stroke="party"
  r={2}
  opacity={0.5} />
<RegressionY
  {data}
  x="date"
  y="value"
  +++fx="party"
  +++
  stroke="party" />
```

`fx` is the **horizontal facet channel** — SveltePlot creates a separate sub-plot for each unique value and lines them up side by side. A shared y-axis makes cross-panel comparison straightforward.

It can make sense to activate the implicit `frame` mark in faceted plots:

```svelte
/// file: App.svelte
<Plot
  +++frame+++
	color={{ legend: true, scheme }}
```
