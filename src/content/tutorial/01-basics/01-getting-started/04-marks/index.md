---
title: Marks
---

`Dot` is a **mark** — a visual component that maps data to geometric shapes. SveltePlot has many marks: `Dot`, `Line`, `BarY`, `RuleY`, and more.

For instance, we can use the [Hull](/marks/delaunay#Hull) mark to add a convex hull around each species. First we import `Hull` alongside `Dot`:

```js
import { Plot, Dot+++, Hull+++ } from 'svelteplot';
```

Then we add it and pass the same data and channels as we're passing to `Dot`:

```svelte
<Plot>
+  <Hull
+    {data}
+    x="body_mass_g"
+    y="bill_length_mm"
+    fill="species"
+    opacity={0.2} />
  <Dot
    {data}
    x="body_mass_g"
    y="bill_length_mm"
    fill="species" />
</Plot>
````

Not all marks need data. `RuleX` draws a vertical reference line at a fixed x value. Again, just import it:

```js
import { Plot, Dot, Hull+++, RuleX+++ } from 'svelteplot';
```

Then add it before the closing `</Plot>` at the end:

```svelte
+  <RuleX x={4500} />
</Plot>
```

The order in which we put the marks inside the Plot determines how they are drawn, first the hull, then the dots and the rule on top.
