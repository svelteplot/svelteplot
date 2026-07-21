---
title: Voronoi tooltips
---

The pointer-events approach works great for bars, but in a scatter plot the `Dot` symbols are often too small to hover over reliably. One solution is to overlay an invisible **Voronoi tessellation** — a set of polygons that partition the plot area so that every pixel belongs to the nearest data point.

Import the `Voronoi` mark and add it on top of the dots:

```js
import { Plot, Dot+++, Voronoi+++ } from 'svelteplot';
```

Place the `Voronoi` mark after `<Dot>` so it sits on top and receives the pointer events. Use `fill="transparent"` so the polygons are invisible but still catchable:

```svelte
  <Dot data={penguins} x="bill_length_mm" y="bill_depth_mm" fill="species" r={3} />
+  <Voronoi
+    data={penguins}
+    x="bill_length_mm"
+    y="bill_depth_mm"
+    fill="transparent"
+    stroke="currentColor"
+    opacity={0.1}
+    onpointerenter={(e, d) => (tooltip = d)}
+    onpointerleave={() => (tooltip = null)}
+  />
  <Frame />
```

```svelte
</Plot>

+{#if tooltip}
+  <p>{tooltip.species}: {tooltip.bill_length_mm} mm × {tooltip.bill_depth_mm} mm</p>
+{/if}
```
