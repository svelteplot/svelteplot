---
title: Grouping
---

To count penguins per species we need the `groupX` transform. It groups all rows sharing the same x value and computes a summary for each group.

Import `groupX` and swap out the `<Dot>` for a grouped `<BarY>`:

```svelte
- import { Plot, Dot } from 'svelteplot';
+ import { Plot, BarY, RuleY, groupX } from 'svelteplot';
```

```svelte
- <Dot data={penguins} x="species" y="body_mass_g" fill="species" />
+ <BarY
+   {...groupX({ data: penguins, x: 'species', fill: 'species' }, { y: 'count' })}
+ />
+ <RuleY y={0} />
```

`groupX` takes the same `{ data, ...channels }` shape that marks use. The second argument sets the output channel — `y: 'count'` computes the number of rows in each group.
