---
title: Map transform
---

Mapping transformations apply a given function to every element in the input
data.

Currently, there are 3 mapping transforms available: cumsum, rank, and quantile.


## Cumsum

The `cumsum` expression stands for Cumulative Sum. It represents how your data
stacks up and changes. At any given point, you get the total sum of all previous
data points.

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

```svelte
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

Here we have the stocks data for Apple, plotted over time, with the cumulative
sum mapping of the Volume. We can see how the volume increases overtime. Any
sudden jumps in the Volume of Apple stocks would be very clear and visible in
this kind of chart.

## Rank

The `rank` function assigns a 0-based index to each datapoint had the data been
sorted. Essentially it tells you where the datapoint lies within your whole
dataset, for the provided property.


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
    let { cars } = $derived(page.data.data);

    let sortedCars = [...cars].sort((a, b) => a["0-60 mph (s)"] - b["0-60 mph (s)"]).slice(0, 10);

</script>

<Plot marginLeft={50} x={{ tickRotate: -45 }}>
  <RuleY y={0} />
  <Line {...mapY({ data:sortedCars, x: 'model', y:'0-60 mph (s)' }, 'rank')}  />
</Plot>
```

```svelte
<script>
    import {
        Plot,
        Line,
        RuleY,
        mapY,
        stackY
    } from 'svelteplot';

    import { page } from '$app/state';
    let { cars } = $derived(page.data.data);

    let sortedCars = [...cars].sort((a, b) => a["0-60 mph (s)"] - b["0-60 mph (s)"]).slice(0, 10);

</script>

<Plot marginLeft={50} x={{ tickRotate: -45 }}>
  <RuleY y={0} />
  <Line {...mapY({ data:sortedCars, x: 'model', y:'0-60 mph (s)' }, 'rank')}  />
</Plot>
```


Here, we are visualizing the top 10 fastest cars, and their ranking. As you can
see, the Y axis does not output the actual seconds to reach 60mph, but rather answers the question "in what
position does each car end up?".

Sorting the cars before passing them to Plot is important, though not strictly necessary.
The rank function just assigns a number to each datapoint based on the position
it would occupy with the property provided (in this case, `"0-60 mph (s)"`). Had
we not sorted the array, the visualization would look like this:


```svelte live
<script>
    import {
        Plot,
        Line,
        RuleY,
        mapY,
        mapX,
        stackY
    } from 'svelteplot';

    import { page } from '$app/state';
    let { cars } = $derived(page.data.data);
</script>

<Plot x={{ tickRotate: -45 }}>
  <RuleY y={0} />
  <Line {...mapY({ data:[...cars].slice(0,10), x: 'model', y:'0-60 mph (s)' }, 'rank')}  />
</Plot>
```

As we can see, here we don't sort the array. We are still taking just 10 cars.
In this case, we see the ordering that was implicit from the dataset, which
appears to be in alphabetical order (though it may not be).

Now the line is jagged, showing what each car's position is with respect to this
subset of 10 cars.


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
