---
title: HTML tooltip
---

Managing tooltip state and positioning manually works, but SveltePlot ships with a `HTMLTooltip` mark that handles both automatically. It uses the same quadtree proximity logic as `Pointer` but renders a floating HTML `<div>` positioned at the hovered data point's screen coordinates.

Remove the `Pointer` mark, the `tooltip` state, and the `{#if}` block. Import `HTMLTooltip` instead:

```svelte
- import { Plot, Dot, Frame, Pointer } from 'svelteplot';
+ import { Plot, Dot, Frame, HTMLTooltip } from 'svelteplot';
```

Replace the `<Pointer>` mark and the `{#if}` block with `<HTMLTooltip>`. The `children` snippet receives `{ datum }` — the nearest data point:

```svelte
-  <Pointer
-    data={penguins}
-    x="bill_length_mm"
-    y="bill_depth_mm"
-    onupdate={(selection) => (tooltip = selection[0] ?? null)}
-  />
+  <HTMLTooltip data={penguins} x="bill_length_mm" y="bill_depth_mm">
+    {#snippet children({ datum })}
+      <strong>{datum?.species}</strong><br />
+      bill: {datum?.bill_length_mm} × {datum?.bill_depth_mm} mm
+    {/snippet}
+  </HTMLTooltip>
```

The tooltip `<div>` is positioned absolutely inside the plot and hidden when no point is nearby. Style it with CSS to match your design.
