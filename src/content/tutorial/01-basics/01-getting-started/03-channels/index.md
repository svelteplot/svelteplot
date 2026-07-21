---
title: Channels
---

The props on a mark — `x`, `y`, `r`, `fill`, `opacity`, and others — are called **channels**. A channel maps a data column (e.g. body mass) to a visual property (e.g. the horizontal position). If we change the `y` channel to `bill_length_mm`, we turn the dot plot into a **scatterplot**!

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

It's still the same `Dot` component, just a different channel assignment! That's the magic of the grammar of graphics. Now use the `fill` channel to color each dot by species:

```svelte
<Plot>
  <Dot
    {data}
    x="body_mass_g"
    y="bill_length_mm"
    fill+++="species"+++ />
</Plot>
```

SveltePlot sees that `fill` maps to string values and assigns a categorical color scheme automatically.

To see the meaning of each color we can pass a `color={{ legend: true }}` to the Plot:

```svelte
<Plot +++color={{ legend: true }}+++>
```

We now see that while the Gentoo penguins are heavier, the Chinstrap penguins also have long bills.
