---
title: Map transform
---

Mapping transformations apply a given function to every element in the input
data.

Currently, there are 3 mapping transforms available: cumsum, rank, and quantile.


## Cumsum

```svelte live
<script>
    import {
        Plot,
        Line,
        RuleY,
        mapY,
        stackY
    } from 'svelteplot';

    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot>
  <RuleY y={0} />
  <Line {...mapY({ data: aapl, x: 'Date', y:'Volume' }, 'cumsum')}  />
</Plot>
```


## Rank

```svelte live
<script>
    import {
        Plot,
        Line,
        mapY,
        mapX,
        RectY,binX
    } from 'svelteplot';

    import { page } from '$app/state';
    let { olympians } = $derived(page.data.data);

    const sortedOlympians = [...olympians].sort((a, b) => b.gold - a.gold).slice(0, 30);
</script>

<Plot marginLeft={50} x={{ tickRotate: -45 }}>
    <Line
        {...mapY(
            { data: sortedOlympians, x: 'name', y: 'gold' },
            'rank'
        )}
    />
</Plot>
```

## Quantile

```svelte live
<script>
    import {
        Plot,
        Line,
        mapY,
        mapX,
        RectY,binX
    } from 'svelteplot';

    import { page } from '$app/state';
    let { olympians } = $derived(page.data.data);

    const sortedOlympians = [...olympians].sort((a, b) => b.gold - a.gold).slice(0, 30);
</script>

<Plot marginLeft={50} x={{ tickRotate: -45 }}>
    <Line
        {...mapY(
            { data: sortedOlympians, x: 'name', y: 'gold' },
            'quantile'
        )}
    />
</Plot>
```


## Map Reference
