<!-- @component
    Creates a horizontal box plot for visualizing data distribution with quartiles and outliers
-->

<script lang="ts">
    interface BoxXMarkProps extends ComponentProps<typeof BoxY> {}
    import { type ComponentProps } from 'svelte';
    import Box from './helpers/Box.svelte';
    import type BoxY from './BoxY.svelte';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';

    let markProps: BoxXMarkProps = $props();

    const DEFAULTS = {
        tickMedian: true,
        tickMinMax: false,
        sort: 'median',
        ...getPlotDefaults().box,
        ...getPlotDefaults().boxX
    };

    const props: BoxXMarkProps & { class?: string } = $derived({
        ...DEFAULTS,
        ...markProps
    });
</script>

<Box {...props} orientation="x" />
