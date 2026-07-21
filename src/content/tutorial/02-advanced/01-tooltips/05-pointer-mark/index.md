---
title: Pointer mark
---

The `Voronoi` approach requires computing and rendering extra geometry. SveltePlot has a simpler alternative: the `Pointer` mark, which uses a **proximity quadtree** to find the nearest data point to the cursor without adding any visible elements.

Replace `Voronoi` with `Pointer`. Instead of `onpointerenter`/`onpointerleave`, use the `onupdate` callback — it fires whenever the selection changes and receives the array of currently selected data points:

```js
import { Plot, Dot, ---Voronoi---+++Pointer+++ } from 'svelteplot';
```

```svelte
-  <Voronoi
-    data={penguins}
-    x="bill_length_mm"
-    y="bill_depth_mm"
-    fill="transparent"
-    stroke="none"
-    onpointerenter={(e, d) => (tooltip = d)}
-    onpointerleave={() => (tooltip = null)}
-  />
+  <Pointer
+    data={penguins}
+    x="bill_length_mm"
+    y="bill_depth_mm"
+    onupdate={(selection) => (tooltip = selection[0] ?? null)}
+  />
```

The `maxDistance` prop (default `15px`) controls how close the cursor must be to select a point. When the cursor moves away, `onupdate` fires with an empty array, so `selection[0] ?? null` clears the tooltip.
