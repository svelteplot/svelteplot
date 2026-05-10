---
title: Curve interpolation
---

By default, `<Line>` connects data points with straight segments (`curve="linear"`). The `curve` option lets you choose a different interpolation method.

Try a step curve to emphasize discrete changes:

```svelte
<Line
  {data}
  x="date"
  y="value"
  stroke="party"
  +++curve="step"+++
/>
```

Or a smooth curve using monotone interpolation, which preserves monotonicity and avoids overshooting:

```svelte
---curve="step"---
+++curve="monotone-x"+++
```

Other useful values include `"basis"` (B-spline), `"catmull-rom"`, and `"natural"`. For geographic projections `curve="auto"` selects the appropriate geodesic curve automatically.
