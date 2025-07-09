---
title: Filter transform
---

The **filter transform** filters a mark’s index to show a subset of the data. For example, below the **filter** option controls which text labels are displayed in a dense scatterplot.

Since the filter transform only affects the mark’s index and not the channel values, it does not affect the default scale domains. Below, the x scale contains every English letter, even though the only the bars for the vowels are shown.

```svelte live
<script lang="ts">
    import { Plot, BarY, filter } from '$lib/index'
    import { page } from '$app/state';
    const { alphabet } = $derived(page.data.data);
    import { getContext } from 'svelte';

    const useCanvas = getContext('useCanvas');
</script>

<Plot>
    <BarY 
        data={alphabet}
        canvas={$useCanvas}
        filter={(d) => /[aeiouy]/i.test(d.letter)}
        x="letter"
        y="frequency" />
</Plot>
```

```svelte
<Plot>
    <BarY 
        data={alphabet}
        filter={(d) => /[aeiouy]/i.test(d.letter)}
        x="letter"
        y="frequency" />
</Plot>
```

[fork](https://svelte.dev/playground/50337f4963264dcb9d4b8cf7c80702b2?version=latest)

TODO(@gka): Fork repl and replace link
