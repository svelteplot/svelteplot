<script module>
    export const title = 'AreaX';
</script>

<script lang="ts">
    import { Plot, AreaX } from 'svelteplot';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';
    import { setContext } from 'svelte';

    let { aapl } = $derived(page.data.data) as ExamplesData;
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
