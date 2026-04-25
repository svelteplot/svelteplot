---
title: Importing data
---

For this tutorial, we're going to use an easier way to load data.

```svelte
/// file: App.svelte
<script>
	---import { csvParse, autoType } from 'd3-dsv';
	let data = $state([]);
	$effect(async () => {
		const res = await fetch('/data/aapl.csv');
		const text = await res.text();
		data = csvParse(text, autoType);
	})---
  +++import data from '/data/aapl.csv';+++
</script>
```

We're also going to add the data file right next to the app so you can inspect it.
