<script module>
    export const title = 'Tick count';
</script>

<script>
    import { Plot, AxisX, AxisY, Line } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot marginTop={30}>
    <AxisY tickCount={20} />
    <AxisX tickCount={2} />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
