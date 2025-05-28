---
title: Transforms
---

Transforms can be used to bring your data and channels into a shape suiting your dataset. In short, a transform is a function to which you pass the dataset, the input channels and optional transform parameters, and which returns an object with the transformed data and channel properties.

```js
function transform({ data, ...channels}, options): { data, ...channels }
```

As an example, let's take a look at the [stackY](/transforms/stack) transform. It takes a dataset and at the very least the channels `x`, `y` and -- for grouping the series -- either `fill`, `stroke`, or `z` channels.

```js
import { stackY } from 'svelteplot';

const inputData = [...];

const { data, ...channels } = stackY({
    data: inputData,
    x: 'date',
    y: 'value',
    z: 'group'
});

```

In the returned `data` array, each item will have new properties `__y1` and `__y2` which store the lower and upper offsets as calculated by the stack transform. Since we no longer want to map `y` to `value`, the `channels` now maps `y1` to `__y1` and `y2` to `__y2`

```svelte --live
<script>
    import { Plot, BarY, RuleY, stackY } from 'svelteplot';
    import { rollups } from 'd3-array';

    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);

    let data = $derived(
        rollups(
            penguins,
            (d) => d.length,
            (d) => d.species,
            (d) => d.island
        )
            .map(([species, group]) =>
                group.map(([island, count]) => ({
                    species,
                    island,
                    count
                }))
            )
            .flat(1)
    );
</script>

<Plot grid>
    <RuleY data={[0]} />
    <BarY
        {...stackY(data, {
            x: 'island',
            y: 'count',
            fill: 'species'
        })} />
</Plot>
```

More text here

```svelte
<script>
    import { Plot, BarY, RuleY, stackY } from 'svelteplot';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot grid>
    <RuleY data={[0]} />
    <BarY
        {...stackY(data, {
            x: 'island',
            y: 'count',
            fill: 'species'
        })} />
</Plot>
```

## Using transforms without Svelte

In case you want to use SveltePlot transforms outside of a Svelte project you can import them via the `svelteplot/transform` entry point:

```js
import { binX } from 'svelteplot/transforms';
```

## Available Transforms

- [bin](/transforms/bin) - Groups data into discrete bins
- [bollinger](/transforms/bollinger) - Creates Bollinger bands for time series data
- [centroid](/transforms/centroid) - Calculates the geometric center of a set of points
- [facet](/transforms/facet) - Splits data into multiple subplots
- [filter](/transforms/filter) - Filters data based on a condition
- [group](/transforms/group) - Groups data by specified dimensions
- [interval](/transforms/interval) - Creates time or numeric intervals
- [jitter](/transforms/jitter) - Adds random noise to prevent overplotting
- [map](/transforms/map) - Applies a mapping function to data
- [normalize](/transforms/normalize) - Scales data to a common range
- [recordize](/transforms/recordize) - Converts raw data to record format
- [rename](/transforms/rename) - Renames channels in a dataset
- [select](/transforms/select) - Selects specific channels or data points
- [shift](/transforms/shift) - Shifts data values by a specified amount
- [sort](/transforms/sort) - Sorts data based on specified criteria
- [stack](/transforms/stack) - Stacks data series on top of each other
- [window](/transforms/window) - Creates a moving window over data
