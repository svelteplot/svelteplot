<script module>
    export const title = 'Unit label tick format';
</script>

<script>
    import { Plot, AxisX, AxisY, Line } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot
    y={{
        tickFormat: (d, i, ticks) =>
            `${d}${i === ticks.length - 1 ? ' USD' : ''}`
    }}>
    <Line data={aapl} x="Date" y="Close" />
</Plot>
