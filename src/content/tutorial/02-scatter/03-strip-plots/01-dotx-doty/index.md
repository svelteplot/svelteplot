---
title: DotX
---

`DotX` is a variant of `Dot` for **one-dimensional distributions**: it only needs an `x` channel and places all points at the same y position.

Swap out the scatter mark, drop the y channel, and facet by species to give each group its own row:

```svelte
---import { Plot, Dot } from 'svelteplot';---
+++import { Plot, DotX } from 'svelteplot';+++
```

```svelte
---<Plot color={{ legend: true }} x={{ label: 'Body mass (g)' }}>---
+++<Plot y={{ grid: true }}>+++
```

```svelte
---<Dot {data} x="body_mass_g" y="bill_length_mm" fill="species" opacity={0.5} />---
+++<DotX {data} x="body_mass_g" fill="species" fy="species" opacity={0.6} />+++
```

Each species now gets its own strip. Gentoo penguins clearly cluster heavier than Adelie and Chinstrap; within each species you can also spot individual outliers.

`DotY` works the same way along the y axis.
