---
title: Quantitative color
---

So far `fill` has mapped a categorical column — species names — to a discrete color scheme. The same channel works with **numeric data** too.

Switch `fill` from `"species"` to `"body_mass_g"`:

```svelte
---  fill="species"---
+++  fill="body_mass_g"+++
```

SveltePlot detects that the column is numeric and switches to a **sequential** color scale automatically — lighter dots are lighter penguins, darker dots are heavier ones.

The scale type is inferred from the data, but you can override it via the `color` option on `<Plot>`:

```svelte
---<Plot>---
+++<Plot color={{ scheme: 'plasma' }}>+++
```
