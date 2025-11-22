<script module>
    export const title = 'AreaX';
    export const data = { aapl: '/data/aapl.csv' };
    export const sortKey = 3;
</script>

<script lang="ts">
    import { Plot, AreaX } from 'svelteplot';
    import type { AaplRow } from '../types';
    let { aapl }: { aapl: AaplRow[] } = $props();
</script>

<div>
    <Plot><AreaX data={aapl} y="Date" x="Close" /></Plot>
    <Plot><AreaX data={aapl} y="Date" x1="Close" /></Plot>
    <Plot><AreaX data={aapl} y="Date" x2="Close" /></Plot>
</div>

<style>
    div {
        columns: 3;
    }
</style>
