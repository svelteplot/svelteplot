---
title: Symbol channel
---

The `fill` channel colors dots by category, but color alone can fail — for colorblind readers, in print, or on low-quality displays.

The `symbol` channel maps data to **marker shape**. Pass the same column as `fill` for redundant encoding:

```svelte
<Dot
  {data}
  x="bill_length_mm"
  y="bill_depth_mm"
  fill="species"
  +++symbol="species"+++
/>
```

The three species now differ by both color _and_ shape, making the chart readable even in black and white. SveltePlot picks a distinct symbol set automatically.
