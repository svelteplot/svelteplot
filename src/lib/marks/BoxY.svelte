<!-- @component
    Creates a vertical box plot for visualizing data distribution with quartiles and outliers
-->
<script lang="ts" module>
    export type BoxProps = {
        data: DataRecord[];
        x: ChannelAccessor;
        y: ChannelAccessor;
        /**
         * Options for the rule marks that represent the min/max range
         */
        rule: Record<string, ChannelAccessor>;
        /**
         * Options for the bar marks that represent the IQR range
         */
        bar: Record<string, ChannelAccessor>;
        /**
         * Options for the tick marks that represent the median
         */
        tickMedian: Record<string, ChannelAccessor> | boolean;
        /**
         * Options for the tick marks that represent the min/max range
         */
        tickMinMax: Record<string, ChannelAccessor> | boolean;
        /**
         * Options for the dot marks that represent the outliers
         */
        dot: Record<string, ChannelAccessor>;
    };
</script>

<script lang="ts">
    import GroupMultiple from './helpers/GroupMultiple.svelte';
    import type { ChannelAccessor, DataRecord } from '$lib/types.js';
    import { groupX, BarY, TickY, RuleX, Dot } from '$lib/index.js';
    import { resolveChannel } from '$lib/helpers/resolve.js';

    let {
        data = [{}],
        x,
        y,
        rule,
        bar,
        tickMedian = true,
        tickMinMax = false,
        dot,
        class: className = null
    }: BoxProps = $props();

    let { data: grouped } = $derived(
        groupX(
            {
                data: data.filter((d) => resolveChannel('x', d, { x, y }) != null),
                x,
                y,
                y1: y,
                y2: y
            },
            { y: 'median', y1: 'p25', y2: 'p75', fill: (rows) => rows }
        )
    );

    let boxData = $derived(
        grouped.map((row) => {
            const iqr = row.__y2 - row.__y1;
            const whisker = iqr * 1.5;
            const lower = row.__y1 - whisker;
            const upper = row.__y2 + whisker;
            const data = row.__fill.map((d) => ({ ...d, __y: resolveChannel('y', d, { x, y }) }));
            const outliers = data.filter((d) => d.__y < lower || d.__y > upper);
            const inside = data
                .filter((d) => d.__y >= lower && d.__y <= upper)
                .sort((a, b) => a.__y - b.__y);
            return {
                __x: row[x],
                p25: row.__y1,
                p75: row.__y2,
                median: row.__y,
                min: inside[0].__y,
                max: inside.at(-1).__y,
                outliers
            };
        })
    );
</script>

<GroupMultiple class="box-y {className || ''}" length={className ? 2 : grouped.length}>
    <RuleX data={boxData} x="__x" y1="min" y2="max" {...rule || {}} />
    <BarY data={boxData} x="__x" y1="p25" y2="p75" fill="#ddd" {...bar || {}} />
    {#if tickMedian}
        <TickY
            data={boxData}
            x="__x"
            y="median"
            strokeWidth={2}
            {...typeof tickMedian === 'object' ? tickMedian : {}} />
    {/if}
    {#if tickMinMax}
        <TickY
            data={boxData}
            x="__x"
            y="min"
            inset="20%"
            {...typeof tickMinMax === 'object' ? tickMinMax : {}} />
        <TickY
            data={boxData}
            x="__x"
            y="max"
            inset="20%"
            {...typeof tickMinMax === 'object' ? tickMinMax : {}} />
    {/if}
    <Dot data={boxData.map((d) => d.outliers).flat()} {x} {y} {...dot || {}} />
</GroupMultiple>
