---
title: Parsing data
---

Now that we loaded the CSV data as test, we need to parse it.


```svelte
/// file: App.svelte
<script>
	+++import { csvParse, autoType } from 'd3-dsv';+++

	let data = +++$state([])+++;

	$effect(async () => {
		$effect(async () => {
		const res = await fetch('/data/aapl.csv');
		---data = await res.text();---
		+++const text = await res.text();
		data = csvParse(text, autoType);+++
	})
</script>
```
