---
title: Fetching a file
---

First we need to learn how to fetch a file.

```svelte
<script>
	let data = $state();

	$effect(async () => {
		---// TODO: fetch a file---
		+++const res = await fetch('/data/aapl.csv');
		data = await res.text();+++
	})
</script>

svelte /// file: App.svelte
```
