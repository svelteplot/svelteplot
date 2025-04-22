---
title: Show text along path
---

```svelte live
<script lang="ts">
    import { Plot, Line, Dot } from '$lib';
    import { Checkbox } from '$lib/ui';

    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);

    let reverse = $state(false);
</script>

<Checkbox label="reverse" bind:value={reverse} />
<Plot grid>
    <Line
        data={reverse
            ? aapl.slice(35, 45).reverse()
            : aapl.slice(35, 45)}
        x="Date"
        y="Close"
        stroke="red"
        curve="basis"
        markerEnd="arrow"
        textFill="blue"
        textStroke="white"
        text="This text runs along the line path" />
</Plot>
```
