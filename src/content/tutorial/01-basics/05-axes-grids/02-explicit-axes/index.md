---
title: Explicit axes
---

The implicit axes are just `AxisX` and `AxisY` marks that SveltePlot inserts for you. Add them explicitly to access their full set of options.

Import them and add them to the plot, turning off the implicit ones with `axes={false}`:

```js
import {
  Plot,
  Dot+++,+++
+  AxisX,
+  AxisY
} from 'svelteplot';
```

```svelte
<Plot axes={false}>
  <Dot {data} x="bill_length_mm" y="body_mass_g" />
  +++<AxisX />+++
  +++<AxisY />+++
</Plot>
```

SveltePlot detects the explicit axes and skips its own, so you can drop `axes={false}`:

```svelte
---<Plot axes={false}>---
+++<Plot>+++
```

Explicit axes expose props like `label`, `ticks`, `tickFormat`, and `anchor` for fine-grained control.

```svelte
<AxisX +++title="Bill length (mm)"+++ />
<AxisY +++title="Body mass (g)"+++ />
```
