<script module>
    export const title = 'Tick interval';
    export const data = { aapl: '/data/aapl.csv' };
</script>

<script>
    import { Plot, AxisX, AxisY, Line } from 'svelteplot';
    let { aapl } = $props();
</script>

<Plot>
    <AxisX interval="6 months" />
    <AxisY interval={25} />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
