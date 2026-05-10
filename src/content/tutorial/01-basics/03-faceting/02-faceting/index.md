---
title: Facet options
---

Faceted plots often benefit from a visible border around each panel. Add the `frame` prop to `<Plot>`:

```svelte
---<Plot color={{ legend: true }}>---
+++<Plot frame color={{ legend: true }}>+++
```

To split vertically instead of horizontally, use `fy` — the **vertical facet channel**. Swap `fx` for `fy` to stack panels top-to-bottom:

```svelte
---  fx="island"---
+++  fy="island"+++
```

You can also combine both: `fx` on one channel and `fy` on another creates a grid of panels — for example, `fx="island"` and `fy="species"` produces a 3×3 facet grid.
