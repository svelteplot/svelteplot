<script module>
    export const title = 'Shifted area';
    export const description =
        'An area plot with the area shifted up and down along the y-axis.';
    export const transforms = ['shift'];
</script>

<script lang="ts">
    import { Plot, Line, AreaY, shiftY } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot y={{ grid: true }}>
    <Line data={aapl} x="Date" y="Close" />
    <AreaY
        {...shiftY(
            { data: aapl, x: 'Date', y: 'Close' },
            { y1: -10, y2: +10 }
        )}
        fill="red"
        opacity="0.2" />
</Plot>
