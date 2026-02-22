<script module>
    export const title = 'AreaY';
    export const data = { aapl: '/data/aapl.csv' };
    export const sortKey = 3;
</script>

<script lang="ts">
    import {
        Plot,
        AreaY,
        setPlotDefaults
    } from 'svelteplot';
    import type { AaplRow } from '../types';

    let { aapl }: { aapl: AaplRow[] } = $props();

    setPlotDefaults({
        height: 100
    });
</script>

<Plot><AreaY data={aapl} x="Date" y="Close" /></Plot>
<Plot><AreaY data={aapl} x="Date" y1="Close" /></Plot>
<Plot><AreaY data={aapl} x="Date" y2="Close" /></Plot>
