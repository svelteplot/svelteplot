<!-- @component
    Calculates and displays a regression line with y as the dependent variable
-->
<script module lang="ts">
    import type { ChannelAccessor } from '../types/index.js';
    import type { RegressionOptions } from './helpers/Regression.svelte';

    export type RegressionYMarkProps = RegressionOptions & {
        data?: Record<string | symbol, any>[];
        z?: ChannelAccessor;
        canvas?: boolean;
    };
</script>

<script lang="ts">
    import { resolveChannel } from '../helpers/resolve.js';
    import type { ChannelName, DataRecord } from 'svelteplot/types/index.js';
    import Mark from '../Mark.svelte';
    import Regression from './helpers/Regression.svelte';
    import { groups as d3Groups } from 'd3-array';

    let { data = [{} as DataRecord], ...options }: RegressionYMarkProps = $props();

    let groupBy: ChannelName | null =
        options.stroke != null ? 'stroke' : options.z != null ? 'z' : null;
    // separate groups
    let groups = $derived(
        groupBy !== null
            ? d3Groups(data, (d) => resolveChannel(groupBy as ChannelName, d, options as any)).map(
                  (g) => g[1]
              )
            : [data]
    );
</script>

<Mark type="regression">
    {#each groups as group, i (i)}
        <Regression data={group as any} dependent="y" {...options as any} />
    {/each}
</Mark>
