<script module>
    export const title = 'Tick count';
    export const data = { aapl: '/data/aapl.csv' };
</script>

<script>
    import { Plot, AxisX, AxisY, Line } from 'svelteplot';
    let { aapl } = $props();
</script>

<Plot marginTop={30}>
    <AxisY tickCount={20} />
    <AxisX tickCount={2} />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
