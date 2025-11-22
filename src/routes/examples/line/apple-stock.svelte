<script module>
    export const title = 'Simple line';
    export const description =
        "The classic line chart example you've seen a million times.";
    export const data = { aapl: '/data/aapl.csv' };
</script>

<script lang="ts">
    import { Plot, Line, RuleY } from 'svelteplot';
    import type { AaplRow } from '../types';
    let { aapl }: { aapl: AaplRow[] } = $props();
</script>

<Plot y={{ grid: true }}>
    <Line data={aapl} x="Date" y="Close" />
</Plot>
