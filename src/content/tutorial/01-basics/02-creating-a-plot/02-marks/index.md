---
title: Marks
---

The `Line` component we loaded is called a **Mark** in SveltePlot. There are many more marks we can use. Let's load the `AreaY` mark.

```svelte
<script>
  import { Plot, Line+++, AreaY+++ } from 'svelteplot';
</script>
```

Then we can add a plot by adding these three lines to the markup:

```svelte
<Plot>
  <Line {data} x="Date" y="Close" />
  +++<AreaY {data} x="Date" y="Close" />+++
</Plot>
```

We can reduce the opacity of the area by setting the `opacity` channel to `0.2`:

```svelte
<AreaY {data} x="Date" y="Close" +++opacity="{0.2}+++" />
```
