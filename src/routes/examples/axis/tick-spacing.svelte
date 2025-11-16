<script module>
    export const title = 'Tick spacing';
</script>

<script>
    import { Plot, AxisX, AxisY, Line } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot marginTop={30}>
    <AxisX tickSpacing={50} />
    <AxisY tickSpacing={5} />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
