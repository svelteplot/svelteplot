<script module>
    export const title = 'AreaY';
</script>

<script lang="ts">
    import {
        Plot,
        AreaY,
        setPlotDefaults
    } from 'svelteplot';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';
    let { aapl } = $derived(page.data.data) as ExamplesData;

    setPlotDefaults({
        height: 100
    });
</script>

<Plot><AreaY data={aapl} x="Date" y="Close" /></Plot>
<Plot><AreaY data={aapl} x="Date" y1="Close" /></Plot>
<Plot><AreaY data={aapl} x="Date" y2="Close" /></Plot>
