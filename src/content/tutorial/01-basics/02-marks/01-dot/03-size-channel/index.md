---
title: Size channel
---

The `r` channel maps data to dot **radius**, turning a scatter plot into a bubble chart. Use `body_mass_g` to size each dot by the penguin's weight:

```svelte
<Dot
  {data}
  x="bill_length_mm"
  y="bill_depth_mm"
  fill="species"
  +++r="body_mass_g"+++
/>
```

Heavier penguins appear as larger circles. SveltePlot applies a square-root scale so dot _area_ is proportional to body mass.

Large dots can overlap the axes — add `inset` to push the plot area inward:

```svelte
---<Plot color={{ legend: true }}>---
+++<Plot color={{ legend: true }} inset={10}>+++
```

By default the radius scale extends to zero, which compresses the visible size range when the smallest value is far from zero. Disable this to use the full range:

```svelte
<Plot color={{ legend: true }} inset={10} +++r={{ zero: false }}+++>
```
