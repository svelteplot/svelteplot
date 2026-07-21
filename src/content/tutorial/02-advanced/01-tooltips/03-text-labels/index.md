---
title: Text labels
---

Showing the hovered value below the chart works, but it would be better to show it directly inside the chart. We can replace the `<p>` tag with a `Text` mark.

First, import `Text` and remove the paragraph below the chart:

```svelte
- import { Plot, BarY, RuleY } from 'svelteplot';
+ import { Plot, BarY, RuleY, Text } from 'svelteplot';
```

Then add the `Text` mark inside `<Plot>`. Pass only the hovered datum as a single-element array — when nothing is hovered, pass an empty array:

```svelte
  <RuleY y={0} />
+  <Text
+    data={tooltip ? [tooltip] : []}
+    x="fruit"
+    y="sales"
+    text={(d) => String(d.sales)}
+    lineAnchor="bottom"
+    dy={-4}
+  />
</Plot>

-{#if tooltip}
-  <p>{tooltip.fruit}: {tooltip.sales} units</p>
-{/if}
```

While we're at it, dim the unselected bars to draw attention to the hovered one:

```svelte
  <BarY
    {data}
    x="fruit"
    y="sales"
+    fillOpacity={tooltip ? (d) => (d === tooltip ? 1 : 0.3) : 1}
    onpointerenter={(e, d) => (tooltip = d)}
    onpointerleave={() => (tooltip = null)}
  />
```
