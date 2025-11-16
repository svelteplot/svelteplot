<script module>
    export const title = 'Tick interval';
</script>

<script>
    import { Plot, AxisX, AxisY, Line } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot>
    <AxisX interval="6 months" />
    <AxisY interval={25} />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
