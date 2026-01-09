<script module>
    export const title = 'Shifted line';
    export const description =
        'A line plot with one line shifted by 2 months along the x-axis.';
    export const transforms = ['shift'];
    export const data = { aapl: '/data/aapl.csv' };
    export const repl =
        'https://svelte.dev/playground/0bc63640234d49e4b381ad8e739d8979?version=latest';
</script>

<script lang="ts">
    import { Plot, Line, shiftX } from 'svelteplot';
    let { aapl } = $props();
</script>

<Plot y={{ grid: true }}>
    <Line data={aapl} x="Date" y="Close" />
    <Line
        {...shiftX(
            { data: aapl, x: 'Date', y: 'Close' },
            '2 months'
        )}
        stroke="var(--svp-red)" />
</Plot>
