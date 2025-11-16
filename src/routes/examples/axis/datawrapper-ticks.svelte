<script module>
    export const title = 'Datawrapper-style ticks';
    export const sortKey = 99;
</script>

<script>
    import {
        Plot,
        AxisX,
        Line,
        GridX,
        RuleY
    } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot>
    <RuleY data={[0]} />
    <AxisX interval="3 months" />
    <GridX />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
