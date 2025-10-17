<script module>
    export const title = 'Shifted line';
    export const description =
        'A line plot with one line shifted by 2 months along the x-axis.';
    export const transforms = ['shift'];
</script>

<script lang="ts">
    import { Plot, Line, shiftX } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
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
