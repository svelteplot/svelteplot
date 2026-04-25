---
title: Explicit axes
---

Under the hood, the axes are rendered by the `AxisX` and `AxisY` marks. We can add them to our plot like we added the `Line` mark. First we import the marks:


```svelte
/// file: App.svelte
import { Plot, Line+++, AxisX, AxisY+++ } from 'svelteplot';
```

Then we add them to the plot:

```svelte
/// file: App.svelte
<Plot axes={false}>
	<Line {data} x="Date" y="Close" />
	+++<AxisX />+++
	+++<AxisY />+++
</Plot>
```

If you add explicit axes to your plot, they will automatically turn off the implicit marks. So if we remove the `axes={false}`, our axes won't be rendered twice.

```svelte
/// file: App.svelte
<Plot ---axes={false}--->
	<Line {data} x="Date" y="Close" />
	<AxisX />
	<AxisY />
</Plot>
```

Adding the axes explicitely allows us to control all of their properties. We can change the color of the text fill and tick line strokes:


```svelte
/// file: App.svelte
<Plot>
	<Line {data} x="Date" y="Close" />
	<AxisX />
	<AxisY +++fill="red" stroke="teal"+++ />
</Plot>
```
