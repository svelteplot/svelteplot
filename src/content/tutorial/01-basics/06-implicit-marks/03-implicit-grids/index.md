---
title: Implicit grids
---

SveltePlot is trying to make your life easier by adding axes automatically. You can disable this by passing `axes={false}` to the `Plot` component:

```svelte
/// file: App.svelte
<Plot +++grid={true}+++>
```

Note that in Svelte, you can also just omit the `={true}`, so this works just the same

```svelte
/// file: App.svelte
<Plot +++grid+++>
```

We can toggle the grids separately for the `x` and `y` axis by using the scale options (we'll come back to them later).

```svelte
/// file: App.svelte
<Plot+++ y={{ grid: true }}+++>
```
