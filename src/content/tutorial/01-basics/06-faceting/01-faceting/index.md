---
title: Faceting
---

Our scatter plot colours dots by island — three clusters are already visible. But what if we also want to see how penguins are distributed _across islands_?

Encoding a second grouping as another channel would make the chart unreadable fast. **Faceting** solves this by splitting the plot into one panel per group.

Add `fy="island"` to the `<Dot>` mark to split horizontally by island:

```svelte
<Dot
  {data}
  x="bill_length_mm"
  y="body_mass_g"
  fill="island"
  +++fy="island"+++
/>
```

SveltePlot creates one sub-plot per unique island value and lines them up side by side. The y-axis is shared across panels so values stay comparable.

It helps to add a frame around each panel to make them visually distinct. Add `frame` to the `<Plot>` component, and perhaps add a little bit of `inset`:

```svelte
<Plot +++frame+++ +++inset={5}+++>
```
