<!-- @component
    Calculates and displays a regression line with y as the dependent variable
-->
<script module lang="ts">
    export type RegressionYMarkProps = RegressionMarkProps;
</script>

<script lang="ts">
    import { resolveChannel } from '$lib/helpers/resolve.js';
    import type { ChannelName } from 'svelteplot/types/index.js';
    import Mark from '../Mark.svelte';
    import Regression, { type RegressionMarkProps } from './helpers/Regression.svelte';
    import { groups as d3Groups } from 'd3-array';

    let { data = [{}], ...options }: RegressionYMarkProps = $props();

    let groupBy: ChannelName | null =
        options.stroke != null ? 'stroke' : options.z != null ? 'z' : null;
    // separate groups
    let groups = $derived(
        groupBy !== null
            ? d3Groups(data, (d) => resolveChannel(groupBy as ChannelName, d, options)).map(
                  (g) => g[1]
              )
            : [data]
    );
</script>

<Mark type="regression">
    {#each groups as group, i (i)}
        <Regression data={group} dependent="y" {...options} />
    {/each}
</Mark>
