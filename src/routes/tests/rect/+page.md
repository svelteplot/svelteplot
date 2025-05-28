```svelte live
<script>
    import { Plot, BarY, RectY, RuleY } from 'svelteplot';

    const timeseries = [
        { year: 2014, population: 2295 },
        { year: 2015, population: 3379 },
        { year: 2016, population: 4464 },
        { year: 2017, population: 5547 },
        { year: 2019, population: 6713 },
        { year: 2020, population: 7795 }
    ];
</script>

<Plot title="RectY" y={{ grid: true }} marginRight={20}>
    <RectY
        data={timeseries}
        x="year"
        y="population"
        interval={1}
        insetLeft={2}
        insetRight={2} />
    <RuleY y={0} />
</Plot>
```

```svelte live
<script>
    import { Plot, RectX, RuleX } from 'svelteplot';

    const timeseries = [
        { year: 2014, population: 2295 },
        { year: 2015, population: 3379 },
        { year: 2016, population: 4464 },
        { year: 2017, population: 5547 },
        { year: 2019, population: 6713 },
        { year: 2020, population: 7795 }
    ];
</script>

<Plot title="RectX" x={{ grid: true }} marginRight={20}>
    <RectX
        data={timeseries}
        y="year"
        x="population"
        interval={1}
        insetTop={2}
        insetBottom={2} />
    <RuleX x={0} />
</Plot>
```
