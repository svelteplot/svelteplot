---
title: Explicit grids
---

The implicit grid is just `GridX` and `GridY` marks that SveltePlot inserts for you. Import them directly to unlock their full set of style props.

Replace the scale option with explicit marks:

```js
import {
  Plot,
  Dot+++,+++
+  GridY
} from 'svelteplot';
```

```svelte
<Plot>
  +++<GridY />+++
  <Dot .../>
```

Now customise the appearance — dashed lines on the y grid, reduced opacity on the x grid:

```svelte
---<GridY />---
+<GridY
+  stroke="red"
+  strokeDasharray="3,3"
+  strokeOpacity={1} />
```

Any SVG stroke prop works: `stroke`, `strokeOpacity`, `strokeWidth`, `strokeDasharray`. Grid marks also accept a `data` prop to draw lines at specific values instead of the auto-computed tick positions.
