---
title: Extending the domain
---

Here's a line chart of Apple's stock closing price from 2013 to 2018. Notice how the y axis starts around $60 — SveltePlot fits the scale tightly to the data by default.

That's usually sensible, but for some charts you want to anchor the y axis at zero to show the true magnitude of values. You can do this simply by adding a reference line at zero:

First we need to add `RuleY` to the list of imports:

```js
import { Plot, Line+++, RuleY+++ } from 'svelteplot';
```

Now we can add `<RuleY y={0} />` to the plot:

```svelte
<Plot>
  <Line {data} x="Date" y="Close" />
  +++<RuleY y={0} />+++
</Plot>
```

`<RuleY y={0} />` draws a horizontal rule at y = 0. The Plot component "collects" the data from all marks and extends the y axis to the data range.
