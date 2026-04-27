---
title: Jitter transform
---

With many polls per month, dots on the same date stack on top of each other. A **jitter transform** spreads them out along the y-axis so overlapping points become visible.

Import `jitterY` alongside the other imports:

```svelte
---import { Plot, Dot } from 'svelteplot';---
+++import { Plot, Dot, jitterY } from 'svelteplot';+++
```

Then wrap the `<Dot>` channels with `jitterY`. It takes the channel object as the first argument and jitter options as the second:

```svelte
-<Dot
-  {data}
-  x="date"
-  y="value"
-  fill="party" />
+<Dot
+  {...jitterY(
+    { data, x: 'date', y: 'value', fill: 'party' },
+    { type: 'normal', std: 0.001 }
+  )} />+++
```

`type: 'normal'` draws from a normal distribution, and `std` controls how wide the spread is (in our case 0.1%).
