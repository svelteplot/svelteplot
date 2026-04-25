---
title: Implicit marks
---

SveltePlot is trying to make your life easier by adding axes automatically. You can also enable two other "implicit" marks: `frame` and `grid`:

```svelte
/// file: App.svelte
<Plot +++grid frame+++>
```

You can disable the implicit axes by passing `axes={false}` to the `Plot` component:

```svelte
/// file: App.svelte
<Plot +++axes={false}+++>
```
