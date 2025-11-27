<!-- @component
    Creates a vertical box plot for visualizing data distribution with quartiles and outliers
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface BoxYMarkProps extends Pick<
        BaseMarkProps<Datum>,
        'class' | 'fill' | 'stroke' | 'fx' | 'fy'
    > {
        data: Datum[];
        x: ChannelAccessor;
        y: ChannelAccessor;
        /**
         * Options for the rule marks that represent the min/max range
         */
        rule: Record<string, ChannelAccessor<Datum>>;
        /**
         * Options for the bar marks that represent the IQR range
         */
        bar: Record<string, ChannelAccessor<Datum>>;
        /**
         * Options for the tick marks that represent the median
         */
        tickMedian: Record<string, ChannelAccessor<Datum>> | boolean;
        /**
         * Options for the tick marks that represent the min/max range
         */
        tickMinMax: Record<string, ChannelAccessor<Datum>> | boolean;
        /**
         * Options for the dot marks that represent the outliers
         */
        dot: Record<string, ChannelAccessor<Datum>>;
    }
    import GroupMultiple from './helpers/GroupMultiple.svelte';
    import { groupX, BarY, TickY, RuleX, Dot } from '$lib/index.js';
    import { resolveChannel } from '$lib/helpers/resolve.js';
    import { getPlotDefaults } from '$lib/hooks/plotDefaults.js';
    import type { BaseMarkProps, ChannelAccessor, DataRecord } from 'svelteplot/types';
    import { IS_SORTED } from 'svelteplot/transforms/sort';

    let markProps: BoxYMarkProps = $props();

    const DEFAULTS = {
        tickMedian: true,
        tickMinMax: false,
        ...getPlotDefaults().box,
        ...getPlotDefaults().boxY
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
    }: BoxYMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    const { data: grouped, ...groupChannels } = $derived(
        groupX(
            {
                data: data.filter((d) => resolveChannel('x', d, { x, y }) != null),
                x,
                y,
                y1: y,
                y2: y,
                fx,
                fy
            },
            { y: 'median', y1: 'p25', y2: 'p75', fill: (rows) => rows }
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
                const { y: median, y1: p25, y2: p75, fill: fill, x: rx } = groupChannels;

                const iqr = row[p75] - row[p25];
                const whisker = iqr * 1.5;
                const lower = row[p25] - whisker;
                const upper = row[p75] + whisker;
                const data = row[fill].map((d) => ({
                    ...d,
                    [Y]: resolveChannel('y', d, { x, y })
                }));
                const outliers = data.filter((d) => d[Y] < lower || d[Y] > upper);
                const inside = data
                    .filter((d) => d[Y] >= lower && d[Y] <= upper)
                    .sort((a, b) => a[Y] - b[Y]);

                return {
                    ...data[0],
                    [X]: row[rx],
                    [P25]: row[p25],
                    [MEDIAN]: row[median],
                    [P75]: row[p75],
                    [MIN]: inside[0][Y],
                    [MAX]: inside.at(-1)[Y],
                    [FX]: resolveChannel('fx', data[0], { fx }, null),
                    [FY]: resolveChannel('fy', data[0], { fy }, null),
                    [OUTLIERS]: outliers
                };
            })
            .sort((a, b) => b[MEDIAN] - a[MEDIAN])
    );
</script>

<GroupMultiple class="box-y {className || ''}" length={className ? 2 : grouped.length}>
    <RuleX
        data={boxData}
        x={X}
        y1={MIN}
        y2={P25}
        {stroke}
        {...sortProps}
        {...rule || {}}
        {...facets} />
    <RuleX data={boxData} x={X} y1={P75} y2={MAX} {stroke} {...rule || {}} {...facets} />
    <BarY data={boxData} x={X} y1={P25} y2={P75} {fill} {stroke} {...facets} {...bar || {}} />
    {#if tickMedian}
        <TickY
            data={boxData}
            x={X}
            y={MEDIAN}
            {...facets}
            {stroke}
            strokeWidth={2}
            {...typeof tickMedian === 'object' ? tickMedian : {}} />
    {/if}
    {#if tickMinMax}
        <TickY
            data={boxData}
            x={X}
            y={MIN}
            {stroke}
            {...facets}
            inset="20%"
            {...typeof tickMinMax === 'object' ? tickMinMax : {}} />
        <TickY
            data={boxData}
            x={X}
            y={MAX}
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
