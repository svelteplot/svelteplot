---
title: Implicit axes
---

You already noticed that SveltePlot adds **axes** to your plot automatically — they are _implicit_ marks that appear without you adding them explicitly. You can disable the implicit axes entirely with `axes={false}`.

```svelte
<Plot +++axes={false}+++>
```

Two more implicit marks are available as shorthand props on `<Plot>`: `grid` adds grid lines, and `frame` adds a border around the plot area:

```svelte
<Plot axes={false} +++grid frame+++>
```
