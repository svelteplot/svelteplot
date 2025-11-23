<script module>
    export const title = 'Y Baseline';
    export const description =
        'A simple horizontal rule at y=0.';
    export const data = { aapl: '/data/aapl.csv' };
</script>

<script lang="ts">
    import { Plot, Line, RuleY } from 'svelteplot';
    let { aapl } = $props();
</script>

<Plot>
    <RuleY y={0} />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
