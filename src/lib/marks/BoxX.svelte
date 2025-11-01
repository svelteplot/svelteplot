<!-- @component
    Creates a horizontal box plot for visualizing data distribution with quartiles and outliers
-->

<script lang="ts">
    interface BoxXMarkProps extends ComponentProps<typeof BoxY> {}
    import GroupMultiple from './helpers/GroupMultiple.svelte';
    import { BarX, TickX, RuleY, Dot, groupY } from '$lib/index.js';
    import { resolveChannel } from '$lib/helpers/resolve.js';
    import { type ComponentProps } from 'svelte';
    import type BoxY from './BoxY.svelte';
    import { getPlotDefaults } from '$lib/hooks/plotDefaults.js';
    import { IS_SORTED } from 'svelteplot/transforms/sort';
    import { sort } from 'd3-array';

    let markProps: BoxXMarkProps = $props();

    const DEFAULTS = {
        tickMedian: true,
        tickMinMax: false,
        ...getPlotDefaults().box,
        ...getPlotDefaults().boxX
    };

    const {
        data = [{}],
        bar,
        rule,
        tickMedian,
        tickMinMax,
        dot,
        x,
        y,
        fx,
        fy,
        fill,
        stroke,
        class: className = ''
    }: BoxXMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    const { data: grouped, ...groupChannels } = $derived(
        groupY(
            {
                data: data.filter((d) => resolveChannel('x', d, { x, y }) != null),
                x,
                y,
                x1: x,
                x2: x,
                fx,
                fy
            },
            { x: 'median', x1: 'p25', x2: 'p75', fill: (rows) => rows }
        )
    );

    const X = Symbol('x'),
        Y = Symbol('y'),
        FX = Symbol('fx'),
        FY = Symbol('fy'),
        P25 = Symbol('p25'),
        P75 = Symbol('p75'),
        MEDIAN = Symbol('median'),
        MIN = Symbol('min'),
        MAX = Symbol('max'),
        OUTLIERS = Symbol('outliers');

    const facets = $derived({
        ...(fx != null && { fx: FX }),
        ...(fy != null && { fy: FY })
    });

    const sortProps = { [IS_SORTED]: true };

    const boxData = $derived(
        grouped
            .map((row) => {
                const { x: median, x1: p25, x2: p75, fill: fill, y: ry } = groupChannels;

                const iqr = row[p75] - row[p25];
                const whisker = iqr * 1.5;
                const lower = row[p25] - whisker;
                const upper = row[p75] + whisker;
                const data = row[fill].map((d) => ({
                    ...d,
                    [X]: resolveChannel('x', d, { x, y })
                }));
                const outliers = data.filter((d) => d[X] < lower || d[X] > upper);
                const inside = data
                    .filter((d) => d[X] >= lower && d[X] <= upper)
                    .sort((a, b) => a[X] - b[X]);

                // if (inside.length === 0) console.log('No data inside boxplot', data, row, lower, upper);
                return {
                    ...data[0],
                    [Y]: row[ry],
                    [P25]: row[p25],
                    [MEDIAN]: row[median],
                    [P75]: row[p75],
                    [MIN]: inside[0][X],
                    [MAX]: inside.at(-1)[X],
                    [FX]: resolveChannel('fx', data[0], { fx }, null),
                    [FY]: resolveChannel('fy', data[0], { fy }, null),
                    [OUTLIERS]: outliers
                };
            })
            .sort((a, b) => b[MEDIAN] - a[MEDIAN])
    );
</script>

<GroupMultiple class="box-x {className || ''}" length={className ? 2 : grouped.length}>
    <RuleY
        data={boxData}
        y={Y}
        x1={MIN}
        x2={P25}
        {stroke}
        {...rule || {}}
        {...facets}
        {...sortProps} />
    <RuleY data={boxData} y={Y} x1={P75} x2={MAX} {stroke} {...rule || {}} {...facets} />
    <BarX data={boxData} y={Y} x1={P25} x2={P75} {fill} {stroke} {...facets} {...bar || {}} />
    {#if tickMedian}
        <TickX
            data={boxData}
            y={Y}
            x={MEDIAN}
            {...facets}
            {stroke}
            strokeWidth={2}
            {...typeof tickMedian === 'object' ? tickMedian : {}} />
    {/if}
    {#if tickMinMax}
        <TickX
            data={boxData}
            x={MIN}
            y={Y}
            {stroke}
            {...facets}
            inset="20%"
            {...typeof tickMinMax === 'object' ? tickMinMax : {}} />
        <TickX
            data={boxData}
            x={MAX}
            y={Y}
            {stroke}
            {...facets}
            inset="20%"
            {...typeof tickMinMax === 'object' ? tickMinMax : {}} />
    {/if}
    <Dot
        data={boxData.map((d) => d[OUTLIERS]).flat()}
        {x}
        {y}
        {fx}
        {fy}
        {fill}
        {stroke}
        {...dot || {}} />
</GroupMultiple>
