<script module>
    export const title = 'Unit label tick format';
    export const data = { aapl: '/data/aapl.csv' };
</script>

<script>
    import { Plot, AxisX, AxisY, Line } from 'svelteplot';
    let { aapl } = $props();
</script>

<Plot
    y={{
        tickFormat: (d, i, ticks) =>
            `${d}${i === ticks.length - 1 ? ' USD' : ''}`
    }}>
    <Line data={aapl} x="Date" y="Close" />
</Plot>
