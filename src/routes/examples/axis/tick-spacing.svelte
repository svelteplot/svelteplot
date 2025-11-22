<script module>
    export const title = 'Tick spacing';
    export const data = { aapl: '/data/aapl.csv' };
</script>

<script>
    import { Plot, AxisX, AxisY, Line } from 'svelteplot';
    let { aapl } = $props();
</script>

<Plot marginTop={30}>
    <AxisX tickSpacing={50} />
    <AxisY tickSpacing={5} />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
