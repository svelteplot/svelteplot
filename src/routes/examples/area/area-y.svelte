<script module>
    export const title = 'AreaY';
    export const data = { aapl: '/data/aapl.csv' };
    export const sortKey = 3;
    export const repl =
        'https://svelte.dev/playground/3a0e5ea3118e48378d9302ce35d992f8?version=latest';
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
