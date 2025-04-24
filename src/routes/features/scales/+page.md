---
title: Scales
---

A core feature of SveltePlot is automatically inferred scale types and domains based on the data that is mapped to mark channels bound to each scale.

In the example below, we have a line mark with the x channel to `"Date"` and y channel mapped to `"Close"`, which are keys of the data objects in the `aapl` array.

The x channel is bound to the _x_ scale, (other marks may also bind channels like x1 or x2 to the same scale). To figure out the scale type, SveltePlot looks at all data values mapped to the x scale. In this case, they are all Date objects, so it infers a _time_ scale. The scale domain is automatically set to the extent of all data values.

```svelte
<Plot grid>
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

```svelte live
<script>
    import { Plot, Line } from '$lib';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot grid testid="aapl-line-frame" height={250}>
    <Line data={aapl} x="Date" y="Close" />
</Plot>
```

Since there's just one explicit mark in the plot and the channels are mapped to property names, SveltePlot will use them as axis titles automatically. In the next example we have a [RuleX](/marks/rule#RuleX) mark which maps two channels to the y scale.

```svelte
<Plot grid>
    <RuleX data={aapl} x="Date" y1="Low" y2="High" />
</Plot>
```

Since we no longer have a single key, the y axis title is left empty.

```svelte live
<script>
    import { Plot, RuleX } from '$lib';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot grid testid="aapl-line-frame" inset={5} height={250}>
    <RuleX
        data={aapl.slice(-120)}
        x="Date"
        y1="Low"
        y2="High" />
</Plot>
```

You can set a custom axis title or domain by providing global scale options:

```svelte
<Plot grid y={{ domain: [140, 200], label: '↑ Price' }}>
    <RuleX data={aapl} x="Date" y1="Low" y2="High" />
</Plot>
```

```svelte live
<script>
    import { Plot, RuleX } from '$lib';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot
    testid="aapl-line-frame"
    inset={5}
    height={250}
    grid
    y={{ domain: [140, 200], label: '↑ Price' }}>
    <RuleX
        data={aapl.slice(-120)}
        x="Date"
        y1="Low"
        y2="High" />
</Plot>
```

SveltePlot tries to automatically detect whether or not to map certain channels to scales, but you can also fine-tune this behavior.

For the positional channels such as x, x1, or y, Plot assumes that you'll always want to map the values to a scale, no matter how they're specified.

SveltePlot will also automatically infer scale domains from the data you mapped to channels that are bound to each scale. You can also set a custom domain using the scale options.

## Continuous scales

### Linear scales

The domain of a quantitative scale is a continuous extent [min, max] where min and max are
numbers, such as temperatures. Below, the first domain value (x = 0) corresponds to the left
side of the plot while the second (x = 100) corresponds to the right side.

```svelte live
<script>
    import { Plot, GridX, GridY, Line } from '$lib';
</script>

<Plot
    x={{ domain: [0, 100], grid: true }}
    marginTop={0}
    marginLeft={10}
    marginRight={10}
    height={70}
    testid="linear" />
```

```svelte
<Plot x={{ domain: [0, 100], grid: true }} />
```

Scales can be reversed using the **reverse** option:

```svelte live
<script>
    import { Plot, GridX, GridY, Line } from '$lib';
</script>

<Plot
    x={{ domain: [0, 100], grid: true, reverse: true }}
    marginTop={0}
    marginLeft={10}
    marginRight={10}
    height={70}
    testid="linear" />
```

```svelte
<Plot x={{ domain: [0, 100], grid: true, reverse: true }} />
```

### Time scales

If the domain is dates, SveltePlot will default to a UTC scale. This is a linear scale with ticks
based on the Gregorian calendar.

```svelte live
<script>
    import { Plot, GridX, GridY, Line } from '$lib';
</script>

<Plot
    x={{
        type: 'time',
        domain: [
            new Date('2021-01-01'),
            new Date('2022-01-01')
        ],
        grid: true
    }}
    marginTop={0}
    marginLeft={20}
    marginRight={20}
    height={70}
    testid="linear" />
```

```svelte
<Plot
    x={{
        domain: [
            new Date('2021-01-01'),
            new Date('2022-01-01')
        ],
        grid: true
    }} />
```

### Logarithmic scales

SveltePlot will automatically detect a scale type, but you can also set it explicitly using the **type** scale option:

```svelte live
<script>
    import { Plot, GridX, GridY, Line } from '$lib';
</script>

<Plot
    x={{ domain: [1, 1000], type: 'log', grid: true }}
    marginTop={0}
    marginLeft={10}
    marginRight={20}
    height={70}
    testid="linear" />
```

```svelte
<Plot x={{ domain: [1, 1000], type: 'log', grid: true }} />
```

### Bi-symmetrical log scales

For input domains ranging multiple magnitudes above and below zero, the bi-symmertrical log scale may be useful. It can be controlled using the `constant` option.

```svelte live
<script>
    import { Plot, RectX } from '$lib';
    import { Slider } from '$lib/ui';

    let constant = $state(1);
</script>

<Slider
    label="constant"
    bind:value={constant}
    min={1}
    max={40} />
<Plot
    x={{
        domain: [-1e6, 1e6],
        type: 'symlog',
        grid: true,
        constant
    }}
    marginTop={0}
    marginLeft={10}
    marginRight={20}
    height={70}>
    <RectX
        data={[1]}
        x1={-constant}
        x2={constant}
        opacity={0.05} />
</Plot>
```

```svelte
<Plot
    x={{
        domain: [-1e6, 1e6],
        type: 'symlog',
        grid: true,
        constant: 1
    }}>
    <RectX x1={-1} x2={1} opacity={0.05} />
</Plot>
```

[fork](https://svelte.dev/playground/3862068a5b8143afbda1cbc30fe6cf17?version=5.28.2)

## Discrete scales

### Point scale

Point scales map a discrete input domain to single coordinates in your plot. SveltePlot automatically choses a point scale if you're mapping categorical data to an extent-less mark, like the [dot](/marks/dot) mark. In the following example, the car manufactors are categorical data so the plot uses a point scale for the x scale.

```svelte live
<script>
    import { Plot, Dot, group } from '$lib';
    import { page } from '$app/state';
    let { cars } = $derived(page.data.data);
</script>

<Plot
    grid
    x={{ tickRotate: -90 }}
    marginTop={30}
    y={{ insetBottom: 10, tickSpacing: 40 }}
    height={350}>
    <Dot
        {...group(
            {
                data: cars,
                y: 'cylinders',
                x: 'manufactor'
            },
            {
                r: 'count'
            }
        )}
        fill />
</Plot>
```

```svelte
<Plot grid x={{ tickRotate: -90 }}>
    <Dot
        {...group(
            {
                data: cars,
                y: 'cylinders',
                x: 'manufactor'
            },
            {
                r: 'count'
            }
        )}
        fill />
</Plot>
```

[fork](https://svelte.dev/playground/d498a8da41734735990aadd7d8ed5a6a?version=5.28.2)

We can force the y scale to use a point scale, too, by setting `type: 'point'` on the `y` scale. Note that the y scale no longer leaves space for cars with seven cylinders, as there is none in our dataset.

```svelte live
<script>
    import { Plot, Dot, group } from '$lib';
    import { page } from '$app/state';
    let { cars } = $derived(page.data.data);
</script>

<Plot
    grid
    x={{ tickRotate: -90 }}
    marginTop={30}
    y={{ type: 'point', insetBottom: 10, tickSpacing: 40 }}
    height={250}>
    <Dot
        {...group(
            {
                data: cars,
                y: 'cylinders',
                x: 'manufactor'
            },
            {
                r: 'count'
            }
        )}
        fill />
</Plot>
```

```svelte
<Plot grid x={{ tickRotate: -90 }} y={{ type: 'point' }}>
    <Dot
        {...group(
            {
                data: cars,
                y: 'cylinders',
                x: 'manufactor'
            },
            {
                r: 'count'
            }
        )}
        fill />
</Plot>
```

[fork](https://svelte.dev/playground/098aa233bd0c40bb808981b123c4b4da?version=5.28.2)

We can also see that the scale is no longer sorted by cylinders, as the domain of discrete scales will not be sorted. We can fix that using the convenient [sort](/transform/sort) transform that's built in to all marks.

```svelte live
<script>
    import { Plot, Dot, group } from '$lib';
    import { page } from '$app/state';
    let { cars } = $derived(page.data.data);
</script>

<Plot
    grid
    x={{ tickRotate: -90 }}
    marginTop={30}
    y={{ type: 'point', insetBottom: 10, tickSpacing: 40 }}
    height={250}>
    <Dot
        {...group(
            {
                data: cars,
                y: 'cylinders',
                x: 'manufactor'
            },
            {
                r: 'count'
            }
        )}
        fill
        sort="-cylinders" />
</Plot>
```

```svelte
<Plot grid x={{ tickRotate: -90 }} y={{ type: 'point' }}>
    <Dot
        {...group(
            {
                data: cars,
                y: 'cylinders',
                x: 'manufactor'
            },
            {
                r: 'count'
            }
        )}
        fill
        sort="-cylinders" />
</Plot>
```

[fork](https://svelte.dev/playground/e53b351b6bb34418a87f149918562f2d?version=5.28.2)

### Band scale

## Categorical colors

Categorical color scales are useful for mapping categories to colors. The following categorical schemes are included in SveltePlot:

```svelte live
<script>
    import { Plot, Dot } from '$lib';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot color={{ legend: true }}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="species" />
</Plot>
```

```svelte
<Plot color={{ legend: true }}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="species" />
</Plot>
```

There are 11 categorical schemes included in SveltePlot, the default is `observable10`.

```svelte live
<script>
    import { Plot, Dot } from '$lib';
    import { Select } from '$lib/ui';
    import { page } from '$app/state';
    let { countries_2020 } = $derived(page.data.data);

    const schemes = [
        'accent',
        'category10',
        'dark2',
        'observable10',
        'paired',
        'pastel1',
        'pastel2',
        'set1',
        'set2',
        'set3',
        'tableau10'
    ];
    let scheme = $state('observable10');
</script>

<Select
    label="scheme"
    options={schemes}
    bind:value={scheme} />
<Plot
    grid
    color={{ legend: true, scheme }}
    y={{ type: 'log' }}
    r={{ range: [2, 14] }}>
    <Dot
        data={countries_2020}
        x="Life expectancy"
        y="GDP per capita"
        r="Population"
        fill="Continent" />
</Plot>
```

```svelte
<Plot
    grid
    y={{ type: 'log' }}
    r={{ range: [2, 14] }}
    color={{ legend: true, scheme: 'observable10' }}>
    <Dot
        data={countries_2020}
        x="Life expectancy"
        y="GDP per capita"
        r="Population"
        fill="Continent" />
</Plot>
```

You can change the default categorical color scheme using the `categoricalColorScheme` option, see [Defaults](/features/defaults)

If you want to map custom colors to your data, you need to pass them via the `schema` option.

```svelte live
<script>
    import { Plot, Dot } from '$lib';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot
    grid
    color={{
        legend: true,
        scheme: [
            'var(--svp-red)',
            'var(--svp-blue)',
            'var(--svp-green)'
        ]
    }}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="species" />
</Plot>
```

```svelte
<Plot
    grid
    color={{
        legend: true,
        scheme: ['red', 'blue', 'green']
    }}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="species" />
</Plot>
```

Note that the colors are picked in the order the categories appear in your dataset. If you want to ensure that certain categories use certain colors, you can define the `domain` option, too:

```svelte live
<script>
    import { Plot, Dot } from '$lib';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot
    grid
    color={{
        legend: true,
        domain: ['FEMALE', 'MALE'],
        scheme: ['var(--svp-green)', 'var(--svp-violet)']
    }}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="sex" />
</Plot>
```

```svelte
<Plot
    grid
    color={{
        legend: true,
        domain: ['FEMALE', 'MALE'],
        scheme: ['green', 'violet']
    }}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="sex" />
</Plot>
```

## Continuous color scales

### Linear

Another very common way to color plots is to map numbers to colors. If you simply use a number column as fill or stroke, SveltePlot will default to a `linear` color scale:

```svelte live
<script>
    import { Plot, Dot } from '$lib';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot
    grid
    height={200}
    color={{
        legend: true,
        label: 'Body mass',
        tickFormat: (d) =>
            Intl.NumberFormat('en-US', {
                style: 'unit',
                unit: 'kilogram'
            }).format(d / 1000)
    }}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="body_mass_g" />
</Plot>
```

```svelte
<Plot grid color={{ legend: true }}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="body_mass_g" />
</Plot>
```

The default color scheme shown above is called `turbo`, but we can change it to a number of other available schemes using the **scheme** option.

```svelte live
<script>
    import { Plot, GridX, GridY, Dot } from '$lib';
    import { page } from '$app/state';
    import { Select } from '$lib/ui';
    let { penguins } = $derived(page.data.data);

    const schemes = [
        'blues',
        'BrBg',
        'BuGn',
        'BuPu',
        'BuRd',
        'BuYlRd',
        'cividis',
        'cool',
        'cubehelix',
        'GnBu',
        'greens',
        'greys',
        'inferno',
        'magma',
        'oranges',
        'OrRd',
        'PiYG',
        'plasma',
        'PrGn',
        'PuBu',
        'PuBuGn',
        'PuOr',
        'PuRd',
        'purples',
        'rainbow',
        'RdBu',
        'RdGy',
        'RdPu',
        'RdYlBu',
        'RdYlGn',
        'reds',
        'sinebow',
        'spectral',
        'turbo',
        'viridis',
        'warm',
        'YlGn',
        'YlGnBu',
        'YlOrBr',
        'YlOrRd'
    ];

    let scheme = $state('plasma');
</script>

<Select
    label="scheme:"
    options={schemes}
    bind:value={scheme} />
<Plot
    grid
    testid="linear"
    color={{ scheme, legend: true }}
    height={200}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="body_mass_g" />
</Plot>
```

```svelte
<Plot color={{ scheme: 'plasma' }}>
    <Dot
        data={seattle}
        x="date"
        y="temp_max"
        stroke="temp_max" />
</Plot>
```

You can also interpolate between custom colors of your liking by passing them as array via the `scheme` option:

```svelte live
<script>
    import { Plot, Dot } from '$lib';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot
    grid
    height={200}
    color={{
        legend: true,
        scheme: ['#fa6244', '#ececec', '#00abe1']
    }}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="body_mass_g" />
</Plot>
```

```svelte
<Plot grid color={{ legend: true }}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="body_mass_g" />
</Plot>
```

### Diverging

You may wonder why some of the color schemes don't use their entire range (e.g., try using the `BuYlRd` scheme above which is supposed to go from blue over yellow to red). That's because SveltePlot recognizes some schemes as `diverging` and automatically adjusts the "center" (or _pivot_) of the domain to be zero.

```svelte live
<script>
    import { Plot, Dot } from '$lib';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot
    grid
    height={200}
    color={{ legend: true, scheme: 'BuYlRd' }}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="body_mass_g" />
</Plot>
```

```svelte
<Plot grid color={{ legend: true, scheme: 'BuYlRd' }}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="body_mass_g" />
</Plot>
```

You can disable this by passing `type: 'linear'` to the color options:

```svelte live
<script>
    import { Plot, Dot } from '$lib';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot
    grid
    height={200}
    color={{
        legend: true,
        type: 'linear',
        scheme: 'BuYlRd'
    }}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="body_mass_g" />
</Plot>
```

```svelte
<Plot
    grid
    color={{
        legend: true,
        type: 'linear',
        scheme: 'BuYlRd'
    }}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="body_mass_g" />
</Plot>
```

Alternatively you can change the center point of the diverging scale using the `pivot` option. This can be useful to highlight values above or below a certain value, like the median of a distribution.

```svelte live
<script>
    import { Plot, Dot } from '$lib';
    import { page } from '$app/state';
    import { Slider } from '$lib/ui';
    let { penguins } = $derived(page.data.data);

    let pivot = $state(4000);
</script>

<Slider
    label="pivot"
    bind:value={pivot}
    min={3000}
    max={6500} />
<Plot
    grid
    height={200}
    color={{ legend: true, pivot, scheme: 'BuYlRd' }}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="body_mass_g" />
</Plot>
```

```svelte
<Plot
    grid
    color={{ legend: true, pivot: 1000, scheme: 'BuYlRd' }}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="body_mass_g" />
</Plot>
```

### Quantile (continuous)

You can set `type: 'quantile-cont'` for a continuous quantile interpolation. Not to be confused with the discrete [quantile](<#Quantile-(discrete)>) scale.

```svelte live
<script>
    import { Plot, Dot } from '$lib';
    import { page } from '$app/state';
    let { countries_2020 } = $derived(page.data.data);
    import { Checkbox } from '$lib/ui';

    let log = $state(true);
</script>

<Plot
    grid
    height={200}
    y={{ type: 'log' }}
    color={{
        scheme: 'OrRd',
        type: 'quantile-cont',
        legend: true
    }}>
    <Dot
        data={countries_2020}
        x="Life expectancy"
        y="Population"
        stroke="GDP per capita" />
</Plot>
```

### Logarithmic

For mapping [power-law distributions](https://en.wikipedia.org/wiki/Power_law) (like income or population) to colors, a logarithmic scale is often useful. You can switch to log scale by passing `type: 'log'` to the color options:

```svelte live
<script>
    import { Plot, Dot } from '$lib';
    import { page } from '$app/state';
    let { countries_2020 } = $derived(page.data.data);
    import { Checkbox } from '$lib/ui';

    let log = $state(true);
</script>

<Plot
    grid
    height={200}
    y={{ type: 'log' }}
    color={{
        legend: true,
        scheme: 'OrRd',
        type: log ? 'log' : 'linear'
    }}>
    <Dot
        data={countries_2020}
        x="Life expectancy"
        y="Population"
        stroke="GDP per capita" />
</Plot>
<Checkbox label="log scale" bind:value={log} />
```

```svelte
<Plot
    grid
    color={{ legend: true, type: 'log', scheme: 'OrRd' }}
    y={{ type: 'log' }}>
    <Dot
        data={countries_2020}
        x="Life expectancy"
        y="Population"
        stroke="GDP per capita" />
</Plot>
```

### Bi-symmetric log

Like log scales but allows for negative values.

```svelte live
<script>
    import { Plot, Dot } from '$lib';
    import { RadioInput } from '$lib/ui';
    import { csvFormat } from 'd3-dsv';
    import { page } from '$app/state';
    let { symlog } = $derived(page.data.data);

    let type = $state('diverging-symlog');
</script>

<RadioInput
    options={[
        'linear',
        'diverging',
        'symlog',
        'diverging-symlog'
    ]}
    bind:value={type} />
<Plot
    color={{
        legend: true,
        scheme: 'BuYlRd',
        type: type
    }}>
    <Dot canvas data={symlog} x="x" y="y" stroke="value" />
</Plot>
```

## Discrete color scales

Discrete color scales map a continuous input domain to a discrete number of colors, controllable via the `n` option.

### Quantize

Quantize is like a "stepped" linear scale, where a continuous input domain is mapped onto a discrete number of colors . With greater `n` values, the quantize scale will look more identical to a linear scale.

```svelte live
<script>
    import { Plot, Cell, formatMonth } from '$lib';
    import { Slider } from '$lib/ui';
    import { page } from '$app/state';
    let n = $state(5);
    let { seattle } = $derived(page.data.data);
</script>

<Slider label="n" bind:value={n} min={2} max={15} />
<Plot
    padding={0}
    aspectRatio={1}
    color={{
        scheme: 'OrRd',
        type: 'quantize',
        n,
        legend: true,
        nice: true
    }}
    y={{
        ticks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        tickFormat: formatMonth('en', 'short')
    }}
    testid="seattle-temp">
    <Cell
        data={seattle}
        filter={(d) => d.date.getUTCFullYear() === 2015}
        x={(d) => d.date.getUTCDate()}
        y={(d) => d.date.getUTCMonth()}
        fill="temp_max"
        inset="0.5" />
</Plot>
```

Again, you can use your custom colors using the `scheme` option. If you omit the `n` option, SveltePlot will automatically use as many output values as you provided colors in your scheme.

```svelte live
<script>
    import { Plot, Dot } from '$lib';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot
    grid
    height={200}
    color={{
        legend: true,
        type: 'quantize',
        scheme: ['#fa6244', '#ececec', '#00abe1']
    }}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="body_mass_g" />
</Plot>
```

```svelte
<Plot
    grid
    color={{
        legend: true,
        type: 'quantize',
        scheme: ['#fa6244', '#ececec', '#00abe1']
    }}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="body_mass_g" />
</Plot>
```

If you also pass the `n` option to set a different number of output values, SveltePlot will interpolate the colors for you:

```svelte live
<script>
    import { Plot, Dot } from '$lib';
    import { Slider } from '$lib/ui';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
    let n = $state(5);
</script>

<Slider label="n" bind:value={n} min={2} max={9} />

<Plot
    grid
    height={200}
    color={{
        legend: true,
        type: 'quantize',
        scheme: ['#fa6244', '#ececec', '#00abe1'],
        n
    }}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="body_mass_g" />
</Plot>
```

```svelte
<Plot
    grid
    color={{
        legend: true,
        type: 'quantize',
        scheme: ['#fa6244', '#ececec', '#00abe1'],
        n: 5
    }}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="body_mass_g" />
</Plot>
```

### Quantile (discrete)

Similiar to the `quantile` scale. Not to be confused with the continuous [quantile](<#Quantile-(continuous)>) scale.

```svelte live
<script>
    import { Plot, Cell, formatMonth } from '$lib';
    import { Slider } from '$lib/ui';
    import { page } from '$app/state';
    let n = $state(5);
    let { seattle } = $derived(page.data.data);
</script>

<Slider label="n" bind:value={n} min={2} max={15} />
<Plot
    padding={0}
    aspectRatio={1}
    color={{
        scheme: 'OrRd',
        type: 'quantile',
        n,
        legend: true
    }}
    y={{
        ticks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        tickFormat: formatMonth('en', 'short')
    }}
    testid="seattle-temp">
    <!-- todo: -->
    <Cell
        data={seattle}
        filter={(d) => d.date.getUTCFullYear() === 2015}
        x={(d) => d.date.getUTCDate()}
        y={(d) => d.date.getUTCMonth()}
        fill="temp_max"
        inset="0.5" />
</Plot>
```

### Threshold

Threshold scales give you absolute freedom for the breaks:

```svelte live
<script>
    import { Plot, Cell, formatMonth } from '$lib';
    import { Slider } from '$lib/ui';
    import { page } from '$app/state';

    let domain_raw = $state('5,10,15,20,25');
    let domain = $derived(
        domain_raw.split(',').map((s) => +s)
    );

    let { seattle } = $derived(page.data.data);
</script>

<input
    type="text"
    bind:value={domain_raw}
    pattern="^(-?\d+(?:\.\d+)?)(,(-?\d+(?:\.\d+)?))*$" />
<Plot
    padding={0}
    aspectRatio={1}
    color={{
        scheme: 'OrRd',
        type: 'threshold',
        domain,
        legend: true
    }}
    y={{
        ticks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        tickFormat: formatMonth('en', 'short')
    }}
    testid="seattle-temp">
    <Cell
        data={seattle}
        filter={(d) => d.date.getUTCFullYear() === 2015}
        x={(d) => d.date.getUTCDate()}
        y={(d) => d.date.getUTCMonth()}
        fill="temp_max"
        inset="0.5" />
</Plot>
```

## Bypassing color scales

The color scales are used whenever a _fill_ or _stroke_ channel is mapped to values that do _not_ represent colors already. So in the following plot, we're **not** using a color scale, because _stroke_ is already mapped to a valid color:

```svelte live
<script>
    import { Plot, GridX, GridY, Dot } from '$lib';
    import { page } from '$app/state';
    let { seattle } = $derived(page.data.data);
</script>

<Plot testid="linear" height={180}>
    <Dot
        data={seattle}
        x="date"
        y="temp_max"
        stroke="crimson" />
</Plot>
```

```svelte
<Plot>
    <Dot
        data={seattle}
        x="date"
        y="temp_max"
        stroke="crimson" />
</Plot>
```

Note that SveltePlot also recognizes generic CSS variables as valid color names, which makes it easier to theme your plots or to provide dark mode colors:

```svelte live
<script>
    import { Plot, GridX, GridY, Dot } from '$lib';
    import { page } from '$app/state';
    let { seattle } = $derived(page.data.data);
</script>

<Plot testid="linear" height={180}>
    <Dot
        data={seattle}
        x="date"
        y="temp_max"
        stroke="var(--brand-red)" />
</Plot>

<style>
    :global(html) {
        --brand-red: crimson;
    }
    :global(html.dark) {
        --brand-red: hotpink;
    }
</style>
```

```svelte
<Plot height={180}>
    <Dot
        data={seattle}
        x="date"
        y="temp_max"
        stroke="var(--brand-red)" />
</Plot>

<style>
    :global(html) {
        --brand-red: crimson;
    }
    :global(html.dark) {
        --brand-red: hotpink;
    }
</style>
```

You can also force SveltePlot to bypass the color scale using `scale: null`.

```svelte live
<script>
    import { Plot, GridX, GridY, Dot } from '$lib';
    import { page } from '$app/state';
    let { seattle } = $derived(page.data.data);
</script>

<Plot testid="linear" height={180}>
    <defs>
        <linearGradient id="gradient" y2="1" x2="0">
            <stop offset="0%" stop-color="#f7f8c8" />
            <stop offset="100%" stop-color="hotpink" />
        </linearGradient>
    </defs>
    <Dot
        data={seattle}
        x="date"
        y="temp_max"
        fill={{ scale: null, value: 'url(#gradient)' }} />
</Plot>
```

```svelte
<Plot height={180}>
    <defs>
        <linearGradient id="gradient" y2="1" x2="0">
            <stop offset="0%" stop-color="#f7f8c8" />
            <stop offset="100%" stop-color="hotpink" />
        </linearGradient>
    </defs>
    <Dot
        data={seattle}
        x="date"
        y="temp_max"
        fill={{ scale: null, value: 'url(#gradient)' }} />
</Plot>
```
