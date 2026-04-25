---
title: Regression mark
---

Instead of the `windowY` moving average we can also use the `RegressionY` mark to fit a linear regression line through the data for each party.

Import `RegressionY` alongside the other marks:

```js
/// file: App.svelte
import { Plot, Dot+++, RegressionY+++ } from 'svelteplot';
```

Then add it inside the `<Plot>`, using `stroke="party"` to colour the regression lines by party:

```svelte
/// file: App.svelte
	<Dot {data} x="date" y="value" fill="party" r={2} opacity={0.5} />
	+++<RegressionY {data} x="date" y="value" stroke="party" />+++
</Plot>
```

Each party gets its own regression line, making the long-term trend for each easy to compare.
