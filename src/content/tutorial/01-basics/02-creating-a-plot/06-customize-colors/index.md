---
title: Customize colors
---

The automatic color scheme is fine, but we can be more specific. Let's map each party to a meaningful color by defining a `scheme` object:

```svelte
/// file: App.svelte
<script>
	import data from './polls.csv';
	import { Plot, Dot } from 'svelteplot';

+++	const scheme = {
		CDUCSU: 'black',
		AfD: 'deepskyblue'
	}+++
</script>
```

Then pass it to the `color` option:

```svelte
/// file: App.svelte
---<Plot color={{ legend: true }}>---
+++<Plot color={{ legend: true, scheme }}>+++
```

Any party not listed in the scheme will still get an automatic color.
