---
title: Your first plot
---

Let's dive right in. We have penguin measurement data loaded — 343 birds, each with a bill length and body mass. You can switch to the `penguins.csv` tab to take a look at the raw CSV data. Now let's visualize it.

## The first dot plot

The first step is to import the `Plot` and `Dot` componetents from `svelteplot`:

```svelte
<script>
  +++import { Plot, Dot } from 'svelteplot';+++
  import data from './penguins.csv';
</script>
```

The [Plot](/features/plot) component is the root componenent for all SveltePlot graphics. The [Dot](/marks/dot) component is one of the many marks you can use to display data (more on marks later).

To put Plot and Dot into work we replace the paragraph with a `<Plot>` and a `<Dot>` mark inside it, to create a dot plot:

```svelte
-<p>Loaded {data.length} penguins.</p>
+<Plot>
+  <Dot {data} x="body_mass_g" y="species" />
+</Plot>
```

`x="body_mass_g"` and `y="species"` tell SveltePlot which columns to map to horizontal and vertical position. Axes and tick labels appear automatically.

This simple dot plot tells us that Gentoo penguins are heavier than Adelie and Chinstrap.

By default, dots show up as outlines (which makes it easier to see overlapping symbols), but you can pass the `fill` property to change that:

```svelte
<Plot>
  <Dot {data} x="body_mass_g" y="species" +++fill+++ />
</Plot>
```
