---
title: Implicit grids
---

The `grid` prop on `<Plot>` adds grid lines for both axes at once. 

```svelte
<Plot +++grid+++>
```

You can also control them per axis using scale options:


```svelte
-<Plot grid>
+<Plot y={{ grid: true }}>
```
