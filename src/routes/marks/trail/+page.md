---
title: Trail mark
---

:::info
added in 0.9.0
:::

Trail marks are similar to line marks, but can have variable widths determined by backing data. They are useful for visualizing paths or trajectories where the width of the path conveys additional information, such as intensity or volume.

In the example below we use the line width to represent elevation along the 12th stage of the 2018 Tour de France.

```svelte live
<script lang="ts">
    import { Plot, Line, Trail } from '$lib/index.js';
    import { page } from '$app/state';

    let { tdf } = $derived(page.data.data);
</script>

<Plot
    y={{ tickSpacing: 100 }}
    r={{ zero: false, range: [1, 20] }}
    aspectRatio={1}
    grid>
    <Line data={tdf} x="long" y="lat" />
    <Trail
        opacity={0.4}
        data={tdf}
        x="long"
        y="lat"
        r="elevation" />
</Plot>
```

```svelte
<Plot
    aspectRatio={1}
    r={{ zero: false, range: [1, 20] }}
    grid>
    <Line data={tdf} x="long" y="lat" />
    <Trail
        opacity={0.4}
        data={tdf}
        x="long"
        y="lat"
        r="elevation" />
</Plot>
```

By default, the trail width (bound the to `r` channel) is scaled using a square-root scale from zero to to the maximum values in the data. Sometimes it is useful to use a linear scale instead, as in Minard's famous chart of Napoleon's 1812 Russian campaign below.

```svelte live
<script lang="ts">
    import { Plot, Trail } from '$lib/index.js';
    import { RadioInput } from '$lib/ui';
    import { page } from '$app/state';

    let { minard } = $derived(page.data.data);
    let scale = $state('linear');
</script>

<RadioInput
    bind:value={scale}
    options={['linear', 'sqrt']} />
<Plot
    r={{ type: scale, range: [1, 20] }}
    aspectRatio={0.75}
    inset={10}
    axes={false}>
    <Trail
        data={minard}
        x="long"
        y="lat"
        cap="butt"
        r="survivors"
        z={(d) => `${d.group}-${d.direction}`}
        fill={(d) =>
            d.direction === 'A'
                ? 'currentColor'
                : 'var(--svp-red)'} />
</Plot>
```

```svelte
<Plot
    r={{ type: 'linear', range: [1, 20] }}
    aspectRatio={0.75}
    inset={10}
    axes={false}>
    <Trail
        data={minard}
        x="long"
        y="lat"
        cap="butt"
        r="survivors"
        z={(d) => `${d.group}-${d.direction}`}
        fill={(d) =>
            d.direction === 'A'
                ? 'currentColor'
                : 'var(--svp-red)'} />
</Plot>
```

The trail mark supports round and butt capping and different interpolating methods. The default is a linear interpolation.

```svelte live
<script lang="ts">
    import { Plot, Line, Trail } from 'svelteplot';
    import type { CurveName } from 'svelteplot/types';

    const curves: CurveName[] = [
        'linear',
        'natural',
        'basis',
        'bump-x'
    ];
    const caps: ('round' | 'butt')[] = ['round', 'butt'];

    const data = [
        [1, 1, 0],
        [2, 2, 1],
        [3, 1, 3]
    ].map(([x, y, r]) => ({ x, y, r }));

    const args = { data, x: 'x', y: 'y', r: 'r' };
</script>

<Plot
    height={400}
    inset={20}
    x={{ axis: false }}
    y={{ axis: false }}
    r={{ range: [1, 20] }}
    fy={{ domain: curves }}
    fx={{ domain: caps }}>
    {#each caps as cap (cap)}
        {#each curves as curve (curve)}
            <Trail
                {...args}
                fy={curve}
                fx={cap}
                {cap}
                {curve}
                opacity={0.4} />
            <Line
                {...args}
                {curve}
                fy={curve}
                fx={cap}
                stroke="black" />
        {/each}
    {/each}
</Plot>
```

:::tip
You can find more examples in the [trail mark examples](/examples/trail).
:::

## Channels and options

The trail mark supports the following **channels**

- **x**: The x-coordinate of the trail.
- **y**: The y-coordinate of the trail.
- **r**: The radius (width) of the trail at each point.
- **fill**: The fill color of the trail.

The appearance of the trail can be further customized using the following **options**:

- **cap**: Specifies the style of the trail's endpoints. Can be either `'round'` (default) or `'butt'`.
- **curve**: The interpolation method used to draw the trail. Accepts same values as line and area marks.
- **tension**: Some curve types support a tension parameter to adjust the tightness of the curve. This is a number between 0 and 1.
- **resolution**: When a non-linear interpolation is used, this option controls the number of points used to approximate the curve. If left undefined or `'auto'`, a default value based on the trail data is used.
- **canvas**: A boolean indicating whether to render the trail using a canvas element for improved performance with large datasets. Default is `false`.
