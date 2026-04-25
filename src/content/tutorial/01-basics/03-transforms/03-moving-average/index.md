---
title: Moving average - part 1
---

Let's add a trend line on top of the dots. Import the `Line` mark and add it to the plot:

```js
/// file: App.svelte
import { Plot, Dot+++, Line+++ } from 'svelteplot';
```

Now let's add the line to the plot:

```svelte
/// file: App.svelte
	<Dot {data} x="date" y="value" fill="party" />
  +++<Line {data} x="date" y="value" />+++
```

Whoa, the line is now connecting all points in our plot. To get separate lines for each party we can set the `stroke` channel to the party column:


```svelte
/// file: App.svelte
	<Dot {data} x="date" y="value" fill="party" />
  <Line {data} x="date" y="value" +++stroke="party"+++ />
```

That doesn't look right — the lines seem to go missing. The reason is that rows in the CSV alternate between parties (CDUCSU, AfD, CDUCSU, AfD…). SveltePlot starts a new line segment every time it sees a different value, so each "line" is only one point long.

The fix is to tell SveltePlot to sort the data by party before drawing, so each party's points are grouped together:

```svelte
/// file: App.svelte
<Line {data} x="date" y="value" stroke="party" +++sort="party"+++ />
```
