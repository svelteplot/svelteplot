---
title: Implicit grids
---

The `grid` prop on `<Plot>` adds grid lines for both axes at once. You can also control them per axis using scale options:

```svelte
---<Plot>---
+++<Plot y={{ grid: true }}>+++
```

Now only the y axis has grid lines — useful when one axis is categorical and the other is quantitative.

Enable both axes independently:

```svelte
<Plot
  +++x={{ grid: true }}+++
  y={{ grid: true }}>
```
