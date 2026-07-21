---
title: Pointer events
---

Every mark in SveltePlot supports native pointer events. The `onpointerenter` handler receives the browser event and the **datum** — the original data record for the element being pointed at.

Add a state variable and wire it up to the bar mark:

```svelte
  const data = [...];

+  let tooltip = $state(null);
```

```svelte
  <BarY
    {data}
    x="fruit"
    y="sales"
+    onpointerenter={(e, d) => (tooltip = d)}
+    onpointerleave={() => (tooltip = null)}
  />
```

Finally, display the tooltip below the chart:

```svelte
</Plot>

+{#if tooltip}
+  <p>{tooltip.fruit}: {tooltip.sales} units</p>
+{/if}
```
