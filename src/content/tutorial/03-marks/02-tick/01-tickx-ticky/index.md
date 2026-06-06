---
title: TickX
---

`TickX` draws a vertical tick mark for each data point instead of a circle — useful for showing every value in a dense strip without dots obscuring each other.

Swap `<DotX>` for `<TickX>`:

```svelte
---import { Plot, DotX } from 'svelteplot';---
+++import { Plot, TickX } from 'svelteplot';+++
```

```svelte
---<DotX {data} x="body_mass_g" fill="species" fy="species" opacity={0.6} />---
+++<TickX {data} x="body_mass_g" stroke="species" fy="species" opacity={0.6} />+++
```

Note that `TickX` uses `stroke` instead of `fill` for color. Where many penguins share the same body mass, the ticks overlap and darken — the density is visible directly.

`TickY` works the same way along the y axis.
