<script module lang="ts">
    export const title = 'Faceted histogram';
    export const description =
        'A faceted histogram showing the distribution of Olympic athletes’ weights, colored by sex. Based on an example from <a href="https://observablehq.com/@observablehq/plot-vertical-histogram">Observable Plot</a>.';
    export const transforms = ['bin'];
    export const sortKey = 41;
    export const repl =
        'https://svelte.dev/playground/7b2a18a5ae1c47ebb634bded17cac335?version=5';
    export const data = {
        olympians: '/data/olympians.csv'
    };
</script>

<script lang="ts">
    import { Plot, RectY, RuleY, binX } from 'svelteplot';
    import type { OlympiansRow } from '../types';

    let { olympians }: { olympians: OlympiansRow[] } =
        $props();
</script>

<Plot
    height={300}
    grid
    marginLeft={40}
    color={{ legend: true }}>
    <RectY
        {...binX(
            {
                data: olympians,
                x: 'weight',
                fy: 'sex',
                fill: 'sex'
            },
            { y: 'count' }
        )} />
    <RuleY data={[0]} />
</Plot>
