<!-- @component
    Creates a vertical box plot for visualizing data distribution with quartiles and outliers
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface BoxYMarkProps extends Pick<
        BaseMarkProps<Datum>,
        'class' | 'fill' | 'stroke' | 'fx' | 'fy'
    > {
        /** the input data array */
        data: Datum[];
        /** the horizontal position channel; bound to a band scale for grouping */
        x: ChannelAccessor;
        /** the vertical position channel; the quantitative values to summarize */
        y: ChannelAccessor;
        /**
         * Custom sort order for grouped box plot data
         */
        sort?:
            | 'min'
            | 'max'
            | 'median'
            | 'p25'
            | 'p75'
            | '-min'
            | '-max'
            | '-median'
            | '-p25'
            | '-p75'
            | ((d: Datum) => RawValue);
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
    import { getPlotDefaults } from '../hooks/plotDefaults.js';
    import Box from './helpers/Box.svelte';
    import type { BaseMarkProps, ChannelAccessor, DataRecord, RawValue } from 'svelteplot/types';

    let markProps: BoxYMarkProps = $props();

    const DEFAULTS = {
        tickMedian: true,
        tickMinMax: false,
        sort: 'median',
        ...getPlotDefaults().box,
        ...getPlotDefaults().boxY
    };

    const props: BoxYMarkProps & { class?: string } = $derived({
        ...DEFAULTS,
        ...markProps
    });
</script>

<Box {...props} orientation="y" />
