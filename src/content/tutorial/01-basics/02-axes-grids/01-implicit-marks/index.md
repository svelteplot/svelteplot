---
title: Implicit axes
---

SveltePlot adds axes to your plot automatically — they are **implicit marks** that appear without you adding them explicitly.

Two more implicit marks are available as shorthand props on `<Plot>`: `grid` adds grid lines, and `frame` adds a border around the plot area:

```svelte
---<Plot>---
+++<Plot grid frame>+++
```

Try removing them one at a time to see the difference. You can also disable all implicit axes entirely with `axes={false}`.
