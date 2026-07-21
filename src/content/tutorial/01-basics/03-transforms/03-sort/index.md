---
title: Sorting
---

The bars appear in alphabetical order. To sort by value instead, add a `sort` prop. It accepts a channel reference: `{ channel: '-y' }` means "sort descending by the y channel":

```svelte
  <BarY
    {...groupX({ data: penguins, x: 'species', fill: 'species' }, { y: 'count' })}
+    sort={{ channel: '-y' }}
  />
```

The `-` prefix reverses the sort order so the tallest bar appears first. Remove it to sort ascending instead.
