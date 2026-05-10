---
title: Your first plot
---

Let's dive right in. We have penguin measurement data loaded — 343 birds, each with a bill length and body mass. Now let's visualize it.

Import `Plot` and `Dot` from `svelteplot`:

```svelte
<script>
  +++import { Plot, Dot } from 'svelteplot';+++
  import data from './penguins.csv';
</script>
```

Then replace the paragraph with a `<Plot>` and a `<Dot>` mark inside it:

```svelte
-<p>Loaded {data.length} penguins.</p>
+<Plot>
+  <Dot {data} x="bill_length_mm" y="body_mass_g" />
+</Plot>
```

`x="bill_length_mm"` and `y="body_mass_g"` tell SveltePlot which columns to map to horizontal and vertical position. Axes and tick labels appear automatically.
