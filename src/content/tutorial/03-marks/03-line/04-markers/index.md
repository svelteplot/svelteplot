---
title: Markers
---

**Markers** place a symbol at specific points along a line. Use `marker` to mark every point, or `markerStart` / `markerEnd` for just the endpoints.

Add a dot at each data point:

```svelte
<Line
  {data}
  x="date"
  y="value"
  stroke="party"
  +++marker="dot"+++
/>
```

To only highlight the endpoints — useful for labeling the latest value — use `markerEnd` instead:

```svelte
---marker="dot"---
+++markerEnd="dot"+++
```

Available marker shapes are `"dot"`, `"circle"`, `"circle-stroke"`, `"arrow"`, and `"arrow-reverse"`. Use `markerScale` to adjust the size:

```svelte
markerEnd="dot"
+++markerScale={2}+++
```
