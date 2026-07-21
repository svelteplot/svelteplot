---
title: Implicit marks
---

You already noticed that SveltePlot adds **axes** to your plot automatically — they are _implicit_ marks that appear without you adding them explicitly. You can disable the implicit axes entirely with `axes={false}`.

```svelte
<Plot +++axes={false}+++>
```

If you want to add explict axes, just import the `AxisX` and `AxisY` marks and add them to the plot:

```js
import { Plot, Dot, +++AxisX, AxisY+++ } from 'svelteplot';
```

When adding axes explicitly, you can customize their appearance with props:

```svelte
+  <AxisX tickFontSize={14} interval={3} />
+  <AxisY fill="fuchsia" stroke="lime" />
</Plot>
````
Two more implicit marks are available as shorthand props on `<Plot>`: `grid` adds grid lines, and `frame` adds a border around the plot area:

```svelte
<Plot axes={false} +++grid frame+++>
```

This is the same as importing `GridX`, `GridY`, and `Frame` and adding them to the plot.
