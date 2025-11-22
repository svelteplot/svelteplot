<script module>
    export const title = 'Datawrapper-style ticks';
    export const sortKey = 99;
    export const data = { aapl: '/data/aapl.csv' };
</script>

<script lang="ts">
    import {
        Plot,
        AxisX,
        Line,
        GridX,
        RuleY
    } from 'svelteplot';
    import type { AaplRow } from '../types';
    let { aapl }: { aapl: AaplRow[] } = $props();
</script>

<Plot>
    <RuleY data={[0]} />
    <AxisX interval="3 months" />
    <GridX />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
