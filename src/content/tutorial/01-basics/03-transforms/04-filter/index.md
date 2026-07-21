---
title: Filtering
---

The `filter` channel takes a function that returns `true` to keep a datum. Transforms like `groupX` apply it before computing groups, so only matching rows are counted.

Show only penguins from Dream and Biscoe islands (excluding Torgersen):

```svelte
  <BarY
    {...groupX(
-      { data: penguins, x: 'species', fill: 'species' },
+      { data: penguins, x: 'species', fill: 'species', filter: (d) => d.island !== 'Torgersen' },
      { y: 'count' }
    )}
    sort={{ channel: '-y' }}
  />
```

The Adelie count drops because many Adelie penguins live on Torgersen island, while Chinstrap and Gentoo are unchanged.
