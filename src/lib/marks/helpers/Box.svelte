<!-- @component
    Internal shared box plot implementation for BoxX and BoxY
-->
<script lang="ts" generics="Datum extends DataRecord">
    type Orientation = 'x' | 'y';

    interface BoxMarkProps extends Pick<
        BaseMarkProps<Datum>,
        'class' | 'fill' | 'stroke' | 'fx' | 'fy'
    > {
        data: Datum[];
        x: ChannelAccessor;
        y: ChannelAccessor;
        /**
         * Custom sort order for grouped box plot data
         */
        sort?: 'min' | 'max' | 'median' | 'p25' | 'p75' | ((d: Datum) => RawValue);
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
        orientation: Orientation;
    }

    import GroupMultiple from './GroupMultiple.svelte';
    import { groupX, groupY, BarY, TickY, RuleX, BarX, TickX, RuleY, Dot } from '../../index.js';
    import { resolveChannel } from '../../helpers/resolve.js';
    import type { BaseMarkProps, ChannelAccessor, DataRecord, RawValue } from 'svelteplot/types';
    import { IS_SORTED } from 'svelteplot/transforms/sort';

    let markProps: BoxMarkProps = $props();

    const {
        data = [{}],
        bar,
        rule,
        tickMedian,
        tickMinMax,
        dot,
        x,
        y,
        sort,
        fx,
        fy,
        fill,
        stroke,
        orientation,
        class: className = ''
    }: BoxMarkProps = $derived(markProps);

    const groupFn = $derived(orientation === 'y' ? groupX : groupY);
    const BarMark = $derived(orientation === 'y' ? BarY : BarX);
    const RuleMark = $derived(orientation === 'y' ? RuleX : RuleY);
    const TickMark = $derived(orientation === 'y' ? TickY : TickX);

    // the channels as if this would be a BoxX
    const xChannel = $derived(orientation === 'y' ? y : x);
    const yChannel = $derived(orientation === 'y' ? x : y);
    const xProp = $derived(orientation === 'x' ? 'x' : 'y');
    const x1Prop = $derived(`${xProp}1`);
    const x2Prop = $derived(`${xProp}2`);
    const yProp = $derived(orientation === 'x' ? 'y' : 'x');

    const { data: grouped, ...groupChannels } = $derived(
        groupFn(
            {
                data: data.filter((d) => resolveChannel(xProp, d, { x, y }) != null),
                x,
                y,
                [x1Prop]: xChannel,
                [x2Prop]: xChannel,
                fx,
                fy
            },
            { [xProp]: 'median', [x1Prop]: 'p25', [x2Prop]: 'p75', fill: (rows) => rows }
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
        OUTLIERS = Symbol('outliers'),
        SORT_REF = Symbol('sortRef');

    const facets = $derived({
        ...(fx != null && { fx: FX }),
        ...(fy != null && { fy: FY })
    });

    const sortProps = { [IS_SORTED]: true };

    const compareValues = (a: RawValue, b: RawValue) =>
        (typeof a === 'string' && typeof b === 'string'
            ? a.localeCompare(b)
            : a > b
              ? 1
              : a < b
                ? -1
                : 0) || 0;

    const boxData = $derived.by(() => {
        const boxes = grouped
            .map((row) => {
                const medianKey = groupChannels[xProp];
                const p25Key = groupChannels[x1Prop];
                const p75Key = groupChannels[x2Prop];
                const groupKey = groupChannels[yProp];

                const iqr = row[p75Key] - row[p25Key];
                const whisker = iqr * 1.5;
                const lower = row[p25Key] - whisker;
                const upper = row[p75Key] + whisker;
                const data = row[groupChannels.fill].map((d) => ({
                    ...d,
                    [orientation === 'y' ? Y : X]: resolveChannel(xProp, d, {
                        x,
                        y
                    })
                }));
                const valueSym = orientation === 'y' ? Y : X;
                const groupSym = orientation === 'y' ? X : Y;
                const outliers = data.filter((d) => d[valueSym] < lower || d[valueSym] > upper);
                const inside = data
                    .filter((d) => d[valueSym] >= lower && d[valueSym] <= upper)
                    .sort((a, b) => a[valueSym] - b[valueSym]);

                return {
                    ...data[0],
                    [SORT_REF]: row[groupChannels.fill]?.[0],
                    [groupSym]: row[groupKey],
                    [P25]: row[p25Key],
                    [MEDIAN]: row[medianKey],
                    [P75]: row[p75Key],
                    [MIN]: inside.length ? inside[0][valueSym] : null,
                    [MAX]: inside.length ? inside.at(-1)[valueSym] : null,
                    [FX]: resolveChannel('fx', data[0], { fx }, null),
                    [FY]: resolveChannel('fy', data[0], { fy }, null),
                    [OUTLIERS]: outliers
                };
            })
            .filter(Boolean);

        const stripSortRef = ({ [SORT_REF]: _, ...rest }) => rest;

        if (!sort) return boxes.map(stripSortRef);

        const [sort_, direction] = maybeSort(sort);

        const sortAccessor =
            typeof sort === 'function'
                ? (d) => sort(d[SORT_REF])
                : (d) => {
                      switch (sort_) {
                          case 'min':
                              return d[MIN];
                          case 'max':
                              return d[MAX];
                          case 'p25':
                              return d[P25];
                          case 'p75':
                              return d[P75];
                          case 'median':
                          default:
                              return d[MEDIAN];
                      }
                  };

        return boxes
            .toSorted(
                (a, b) =>
                    compareValues(sortAccessor(a), sortAccessor(b)) *
                    direction *
                    (orientation === 'x' ? -1 : 1)
            )
            .map(stripSortRef);
    });

    function maybeSort(
        sort: string | ((d: Datum) => RawValue) | undefined
    ): [string | ((d: Datum) => RawValue), 1 | -1] {
        if (typeof sort !== 'string') return [sort, 1];
        if (sort.startsWith('-')) {
            return [sort.slice(1), -1];
        }
        return [sort, 1];
    }

    const valueSymbol = $derived(orientation === 'y' ? Y : X);
    const groupSymbol = $derived(orientation === 'y' ? X : Y);
    const length = $derived(className ? 2 : grouped.length);
    const baseClass = $derived(`box-${orientation} ${className || ''}`);
</script>

<GroupMultiple class={baseClass} {length}>
    <RuleMark
        data={boxData}
        {...{ [yProp]: groupSymbol, [x1Prop]: MIN, [x2Prop]: P25 }}
        {stroke}
        {...rule || {}}
        {...facets}
        {...sortProps} />
    <RuleMark
        data={boxData}
        {...{ [yProp]: groupSymbol, [x1Prop]: P75, [x2Prop]: MAX }}
        {stroke}
        {...rule || {}}
        {...facets} />
    <BarMark
        data={boxData}
        {...{ [yProp]: groupSymbol, [x1Prop]: P25, [x2Prop]: P75 }}
        {fill}
        {stroke}
        {...facets}
        {...bar || {}} />
    {#if tickMedian}
        <TickMark
            data={boxData}
            {...{ [yProp]: groupSymbol, [xProp]: MEDIAN }}
            {...facets}
            {stroke}
            strokeWidth={2}
            {...typeof tickMedian === 'object' ? tickMedian : {}} />
    {/if}
    {#if tickMinMax}
        <TickMark
            data={boxData}
            {...{ [yProp]: groupSymbol, [xProp]: MIN }}
            {stroke}
            {...facets}
            inset="20%"
            {...typeof tickMinMax === 'object' ? tickMinMax : {}} />
        <TickMark
            data={boxData}
            {...{ [yProp]: groupSymbol, [xProp]: MAX }}
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
