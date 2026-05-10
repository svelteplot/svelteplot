---
title: Layering marks
---

A plot is a stack of marks drawn in order — marks listed later appear on top. You can add as many as you like.

Import `RuleX` and add a vertical reference line at 45 mm, where Adelie bills end and Chinstrap/Gentoo bills begin:

```svelte
---import { Plot, Dot, RuleY } from 'svelteplot';---
+++import { Plot, Dot, RuleX, RuleY } from 'svelteplot';+++
```

```svelte
<Plot>
  <Dot {data} x="bill_length_mm" y="body_mass_g" />
  <RuleY y={4000} />
  +++<RuleX x={45} />+++
</Plot>
```

The two reference lines divide the plot into quadrants. Later marks render on top — this matters most when layering filled shapes like bars or areas, where one mark can completely cover another.
