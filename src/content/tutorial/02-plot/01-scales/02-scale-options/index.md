---
title: The zero option
---

In the previous lesson you extended the y scale by adding a `<RuleY y={0} />` mark. That adds a visible line. If you want to anchor the axis at zero _without_ drawing a reference line, use the `zero` scale option instead:

```svelte
---<Plot y={{ grid: true }}>---
+++<Plot y={{ grid: true, zero: true }}>+++
```

`zero: true` tells SveltePlot to always include zero in the y domain, no matter what the data looks like. The same option works on the x scale too.

Scale options are passed as an object to the corresponding scale prop (`x`, `y`, `color`, `r`, etc.) on `<Plot>`. You've already seen one: `grid: true` adds grid lines to that scale's axis.
