---
title: Moving average - part 2
---

Now let's use the `windowY` transform to turn the raw line into a moving average. Import it and replace the plain `<Line>` with a windowed one:

```js
/// file: App.svelte
import { Plot, Dot, Line+++, windowY+++ } from 'svelteplot';
```

```svelte
/// file: App.svelte
---<Line {data} x="date" y="value" stroke="party" sort="party" />---
+++<Line
	{...windowY(
		{ data, x: 'date', y: 'value', stroke: 'party' },
		{ k: 14, anchor: 'end' }
	)} />+++
```

`k: 14` averages over 14 polls and `anchor: 'end'` makes it a trailing window (only past polls). `outlineStroke` adds a white halo so the line stays readable over the dots.

Now tone down the dots so the trend line stands out more:

```svelte
/// file: App.svelte
<Dot {data} x="date" y="value" fill="party" +++r={2} opacity={0.5}+++ />
```
We can also give the lines an `outlineStroke` for more contrast:

```svelte
/// file: App.svelte
<Line
	{...windowY(
		{ data, x: 'date', y: 'value', stroke: 'party' },
		{ k: 14, anchor: 'end' }
	)}
	+++strokeWidth={2}+++
	+++outlineStroke="white"+++ />
```

Finally, add `strict: true` to suppress the line at the start where fewer than 14 polls are available:

```svelte
/// file: App.svelte
---		{ k: 14, anchor: 'end' }---
+++		{ k: 14, anchor: 'end', strict: true }+++
```
