<script module>
    export const title = 'Stacked density plot';
    export const data = {
        iris: '/data/iris2.csv'
    };
    export const description =
        'Stacked density plot of the measurements in the <a href="https://en.wikipedia.org/wiki/Iris_flower_data_set">Iris flower dataset</a>, showing density estimates for each measurement type stacked on top of each other. Note that it may be better to use a <a href="layered-density">layered density plot</a> for better readability.';
    export const transforms = ['density'];
    export const sortKey = 111;
    export const repl =
        'https://svelte.dev/playground/d30da287a9974c57a149ce742d5585d5?version=latest';
</script>

<script lang="ts">
    import {
        Plot,
        AreaY,
        densityX,
        Line
    } from 'svelteplot';
    import type { Iris2Row } from '../types';
    import RuleY from 'svelteplot/marks/RuleY.svelte';
    import Select from '$shared/ui/Select.svelte';

    let { iris }: { olympians: Iris2Row[] } = $props();
    let kernel = $state('epanechnikov');
</script>

<Select
    bind:value={kernel}
    options={[
        'gaussian',
        'epanechnikov',
        'uniform',
        'triangular',
        'triweight',
        'cosine',
        'quartic'
    ]}
    label="Kernel" />
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
            { kernel }
        )}
        curve="basis" />
</Plot>
