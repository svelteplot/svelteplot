---
title: Marks
---

`Dot` is a **mark** — a visual component that maps data to geometric shapes. SveltePlot has many marks: `Dot`, `Line`, `BarY`, `RuleY`, and more.

Not all marks need data. `RuleY` draws a horizontal reference line at a fixed y value. Import it alongside `Dot`:

```svelte
---import { Plot, Dot } from 'svelteplot';---
+++import { Plot, Dot, RuleY } from 'svelteplot';+++
```

Then add it inside `<Plot>`:

```svelte
<Plot>
  <Dot {data} x="bill_length_mm" y="body_mass_g" />
  +++<RuleY y={4000} />+++
</Plot>
```

The line marks 4,000 g — roughly where lighter Adelie and Chinstrap penguins separate from heavier Gentoos. For a single rule you can just pass a `y` position, but you can also map the `body_mass_g` variable as the `RuleY` mark data:

```svelte
---<RuleY y={4000} />---
+++<RuleY {data} y="body_mass_g" />+++
```
