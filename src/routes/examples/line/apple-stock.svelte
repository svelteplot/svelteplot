<script module>
    export const title = 'Simple line';
    export const description =
        "The classic line chart example you've seen a million times.";
</script>

<script lang="ts">
    import { Plot, Line, RuleY } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot y={{ grid: true }}>
    <Line data={aapl} x="Date" y="Close" />
</Plot>
