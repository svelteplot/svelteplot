<script module>
    export const title = 'Line grouping';
    export const data = { aapl: '/data/aapl.csv' };
    export const repl =
        'https://svelte.dev/playground/560acc13b1844298a2fce48b9f71ea2e?version=latest';
</script>

<script lang="ts">
    import { Plot, Line } from 'svelteplot';
    import type { AaplRow } from '../types';
    let { aapl }: { aapl: AaplRow[] } = $props();
</script>

<Plot color={{ scheme: 'rainbow' }}>
    <Line
        data={aapl}
        x="Date"
        y="Close"
        stroke={(d) => d.Date.getFullYear()} />
</Plot>
