---
title: Implicit axes
---

SveltePlot adds axes to your plot automatically — they are **implicit marks** that appear without you adding them explicitly. You can disable the implicit axes entirely with `axes={false}`.


```svelte
---<Plot>---
+++<Plot axes={false}>+++
```

Two more implicit marks are available as shorthand props on `<Plot>`: `grid` adds grid lines, and `frame` adds a border around the plot area:

```svelte
<Plot axes={false} +++grid frame+++>
```
