<script module>
    export const title = 'Density plot';
    export const data = {
        olympians: '/data/olympians.csv'
    };
</script>

<script lang="ts">
    import { Plot, AreaY, densityX } from 'svelteplot';
    import type { OlympiansRow } from '../types';
    import RuleY from 'svelteplot/marks/RuleY.svelte';

    let { olympians }: { olympians: OlympiansRow[] } =
        $props();
</script>

<Plot y={{ percent: true }}>
    <RuleY y={0} />
    <AreaY
        {...densityX({
            data: olympians,
            fill: 'sex',
            x: 'weight',
            fy: 'sex'
        })} />
</Plot>
