---
title: Unfaceted data
---

Each panel currently only shows the penguins from that island — the other rows are filtered out. That makes it easy to focus on one island, but harder to compare it against the whole population.

You can add context to every panel at once by including a mark **without** a facet channel. A mark that has no `fy` (or `fx`) is drawn in every panel using the full dataset.

Add a second `<Dot>` before the existing one, without `fy`:

```svelte
<Plot frame>
+  <Dot
+    {data}
+    x="bill_length_mm"
+    y="body_mass_g"
+    fill="gray"
+    opacity={0.3}
+    r={2} />
  <Dot
    {data}
    x="bill_length_mm"
    y="body_mass_g"
    fill="species"
    fy="island" />
</Plot>
```

The gray dots appear in every panel, giving each island's cluster a reference against the full population.
