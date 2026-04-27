---
title: Moving average - part 2
---

Now let's use the `windowY` transform to turn the raw line into a moving average. Import it and replace the plain `<Line>` with a windowed one:

```js
import { Plot, Dot, Line+++, windowY+++ } from 'svelteplot';
```

```svelte
-<Line
-  {data}
-  x="date"
-  y="value"
-  stroke="party"
-  sort="party" />
+<Line
+  {...windowY(
+    { data, x: 'date', y: 'value', stroke: 'party' },
+    { k: 14, anchor: 'end' }
+  )} />
```

`k: 14` averages over 14 polls and `anchor: 'end'` makes it a trailing window (only past polls). `outlineStroke` adds a white halo so the line stays readable over the dots.

Now tone down the dots so the trend line stands out more:

```svelte
<Dot
  {data}
  x="date"
  y="value"
  fill="party"
  +++r={2}+++
  +++opacity={0.5}+++ />
```

We can also give the lines an `outlineStroke` for more contrast:

```svelte
<Line
  {...windowY(
    { data, x: 'date', y: 'value', stroke: 'party' },
    { k: 14, anchor: 'end' }
  )}
  +++strokeWidth={2}+++
  +++outlineStroke="var(--bg-1)"+++ />
```

Finally, add `strict: true` to suppress the line at the start where fewer than 14 polls are available:

```js
---  { k: 14, anchor: 'end' }---
+++  { k: 14, anchor: 'end', strict: true }+++
```
