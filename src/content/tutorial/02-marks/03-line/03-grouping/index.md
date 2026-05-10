---
title: Grouping
---

When a dataset contains multiple series, a single `Line` connects everything into one tangled path — try looking at the BLS metro unemployment data without any grouping in the starter.

The fix is the **z channel**, which splits the data into separate line paths by a key column without affecting the color:

```svelte
<Line
  {data}
  x="date"
  y="unemployment"
  +++z="division"+++
/>
```

More often you want each series to have its own color. Use the **stroke channel** instead — it groups implicitly _and_ colors the lines:

```svelte
---<Line {data} x="date" y="unemployment" z="division" />---
+++<Line {data} x="date" y="unemployment" stroke="division" />+++
```

If you need grouping and color to come from _different_ columns, set both explicitly: `z="group" stroke="category"`.
