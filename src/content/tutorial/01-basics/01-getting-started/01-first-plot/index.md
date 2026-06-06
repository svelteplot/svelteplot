---
title: Your first plot
---

Let's dive right in. We have penguin measurement data loaded — 343 birds, each with a bill length and body mass. You can switch to the `penguins.csv` tab to take a look at the raw CSV data. Now let's visualize it.

For this we import the `Plot` and `Dot` componetents from `svelteplot`:

```svelte
<script>
  +++import { Plot, Dot } from 'svelteplot';+++
  import data from './penguins.csv';
</script>
```

The Plot component is the root componenent for all SveltePlot graphics. The Dot component is one of the many marks you can use to display data (more on marks later).

To put Plot and Dot into work we replace the paragraph with a `<Plot>` and a `<Dot>` mark inside it:

```svelte
-<p>Loaded {data.length} penguins.</p>
+<Plot>
+  <Dot {data} x="bill_length_mm" y="body_mass_g" />
+</Plot>
```

`x="bill_length_mm"` and `y="body_mass_g"` tell SveltePlot which columns to map to horizontal and vertical position. Axes and tick labels appear automatically.
