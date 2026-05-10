---
title: Text along lines
---

Instead of a legend, you can label lines directly by rendering text along each path. Use the `text` option to specify which field to display:

```svelte
<Line
  {data}
  x="date"
  y="value"
  stroke="party"
  +++text="party"+++
/>
```

By default the label appears at the midpoint of the line. Use `textStartOffset` to move it — values are percentages or pixel offsets along the path:

```svelte
text="party"
+++textStartOffset="10%"+++
```

Use `textFill` to control the label color independently from the line color, and `textStroke` with `textStrokeWidth` to add a halo that improves legibility against busy backgrounds:

```svelte
textStartOffset="10%"
+++textStroke="var(--svelteplot-bg)"
textStrokeWidth={4}+++
```
