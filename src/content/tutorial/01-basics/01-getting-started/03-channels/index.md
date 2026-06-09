---
title: Channels
---

The props on a mark — `x`, `y`, `r`, `fill`, `opacity`, and others — are called **channels**. A channel maps a data column (or a constant) to a visual property. If we change the y channel to `bill_length_mm`, we turn the dot plot into a scatter plot:

```svelte
<Plot>
  <Dot
    {data}
    x="body_mass_g"
-    y="species"
+    y="bill_length_mm"
    fill />
</Plot>
```

It' stil the same `Dot` component, just a different channel assignment! Use the `fill` channel to color each dot by species:

```svelte
<Plot>
  <Dot
    {data}
    x="body_mass_g"
    y="bill_length_mm"
    +++fill="species"+++ />
</Plot>
```

SveltePlot sees that `fill` maps to string values and assigns a categorical color scheme automatically.

A channel value can be:

- A **column name**: `fill="species"` — maps each row's value to a color
- A **constant**: `fill="steelblue"` — every dot gets the same color
- A **function**: `fill={d => d.body_mass_g > 4000 ? 'tomato' : 'steelblue'}` — full control

The same rule applies to every channel: `x`, `y`, `fill`, `stroke`, `opacity`, `r`, and more.
