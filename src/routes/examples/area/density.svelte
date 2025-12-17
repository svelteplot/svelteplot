<script module>
    export const title = 'Faceted density plot';
    export const data = {
        olympians: '/data/olympians.csv'
    };
    export const description =
        'Density plot of the weights of Olympians, faceted by sex';
    export const transforms = ['density'];
    export const sortKey = 110;
    export const repl =
        'https://svelte.dev/playground/742e758c08fa4bb5af260e9fc2201607?version=latest';
</script>

<script lang="ts">
    import { Plot, AreaY, densityX } from 'svelteplot';
    import type { OlympiansRow } from '../types';
    import RuleY from 'svelteplot/marks/RuleY.svelte';

    let { olympians }: { olympians: OlympiansRow[] } =
        $props();
</script>

<Plot grid y={{ percent: true }}>
    <RuleY y={0} />
    <AreaY
        {...densityX({
            data: olympians,
            fill: 'sex',
            x: 'weight',
            fy: 'sex'
        })} />
</Plot>
