<script module>
    export const title = 'Unit label tick format';
    export const data = { aapl: '/data/aapl.csv' };
</script>

<script lang="ts">
    import { Plot, Line } from 'svelteplot';
    import type { AaplRow } from '../types';
    let { aapl }: { aapl: AaplRow[] } = $props();
</script>

<Plot
    y={{
        tickFormat: (d, i, ticks) =>
            `${d}${i === ticks.length - 1 ? ' USD' : ''}`
    }}>
    <Line data={aapl} x="Date" y="Close" />
</Plot>
