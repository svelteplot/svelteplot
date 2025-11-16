<script module>
    export const title = 'Ticks inside';
</script>

<script>
    import { Plot, AxisY, Line } from 'svelteplot';
    import { page } from '$app/state';

    let { aapl } = $derived(page.data.data);
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
