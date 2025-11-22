<script module>
    export const title = 'Ticks inside';
    export const data = { aapl: '/data/aapl.csv' };
</script>

<script>
    import { Plot, AxisY, Line } from 'svelteplot';
    let { aapl } = $props();
</script>

<Plot
    marginTop={30}
    x={{ insetLeft: 25 }}
    y={{ grid: true }}>
    <AxisY
        tickSize={0}
        tickPadding={0}
        dy={-5}
        lineAnchor="bottom"
        textAnchor="start" />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
