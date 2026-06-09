---
title: Transforms
---

Transforms are useful when your dataset is not in the shape you need it to be visualized. In the chart you see fruit sales numbers represented as bars ranging from zero to more than 2000 sales units. 

But if you take a look at the dataset, you'll find the largest number to be the Q1 Apple sales at 1448 units. How is that?

SveltePlot's BarY mark automatically (or implicitely) applied a **stackY transform**! It groups all dataset rows by the `x` values and stacks their `y` values on top of each other.

This happens whenever you only pass a `y` channel instead of a `y1`/`y2` range, which is what the Bar mark actually visualizes.

Try changing the `y="Sales"` to `y1={0} y2="Sales"` to see what happens without the stacking:

```svelte
<BarY {data} x="Quarter" ---y="Sales"--- +++y1={0} y2="Sales"+++ />
```
