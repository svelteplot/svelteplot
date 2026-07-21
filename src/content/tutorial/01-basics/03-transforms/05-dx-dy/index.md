---
title: dx and dy
---

`dx` and `dy` are **post-scale pixel offsets**. Unlike x/y channels they work in screen pixels rather than data units, shifting a mark by a fixed number of pixels after scales have been applied.

One use is a shadow effect: render a gray copy of the bars slightly offset, then draw the main bars on top.

Store the grouped channels in a `$derived` so they are computed only once:

```svelte
+ const grouped = $derived(
+   groupX({ data: penguins, x: 'species', fill: 'species' }, { y: 'count' })
+ );
```

Then add a shadow `<BarY>` before the main one:

```svelte
<Plot>
+  <BarY {...grouped} fill="#aaa" dx={3} dy={3} />
  <BarY {...grouped} />
  <RuleY y={0} />
</Plot>
```

The shadow mark renders first (underneath) and is shifted 3 px right and 3 px down. The main bars are drawn on top at the normal position.
