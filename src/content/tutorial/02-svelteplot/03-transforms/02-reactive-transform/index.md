---
title: Reactive transforms
---

Let's allow the user to control the jitter spread!

First, declare a reactive `std` variable using Svelte's `$state`:

```svelte
/// file: App.svelte
<script>
	import data from './polls.csv';
	import { Plot, Dot, jitterY } from 'svelteplot';

	const scheme = {
		CDUCSU: 'black',
		AfD: 'deepskyblue'
	}

	+++let std = $state(0.001);+++
</script>
```

Then pass it to `jitterY` instead of the hardcoded value:

```svelte
/// file: App.svelte
---<Dot {...jitterY(
	{ data, x: 'date', y: 'value', fill: 'party' },
	{ type: 'normal', std: 0.001 }
)} />---
+++<Dot {...jitterY(
	{ data, x: 'date', y: 'value', fill: 'party' },
	{ type: 'normal', std }
)} />+++
```

Finally, add a range input bound to `std` so the user can adjust the spread interactively:

```svelte
/// file: App.svelte
+++<input
	type="range"
	bind:value={std}
	min={0}
	max={1/100}
	step={1/10000} /> {std}+++
```

Because `std` is reactive, the chart re-renders whenever the slider moves — no extra code needed.
