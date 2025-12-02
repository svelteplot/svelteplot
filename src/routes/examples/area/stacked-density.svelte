<script module>
    export const title = 'Stacked density plot';
    export const data = {
        iris: '/data/iris2.csv'
    };
    export const description =
        'Stacked density plot of the measurements in the <a href="https://en.wikipedia.org/wiki/Iris_flower_data_set">Iris flower dataset</a>, showing density estimates for each measurement type stacked on top of each other.';
    export const transforms = ['density'];
    export const sortKey = 111;
</script>

<script lang="ts">
    import { Plot, AreaY, densityX } from 'svelteplot';
    import type { Iris2Row } from '../types';
    import RuleY from 'svelteplot/marks/RuleY.svelte';

    let { iris }: { olympians: Iris2Row[] } = $props();
</script>

<Plot
    color={{ legend: true }}
    y={{ label: 'Density', percent: true }}
    grid>
    <RuleY y={0} />
    <AreaY
        {...densityX(
            {
                data: iris,
                x: 'Value',
                fill: 'Measurement'
            },
            { trim: false }
        )} />
</Plot>
