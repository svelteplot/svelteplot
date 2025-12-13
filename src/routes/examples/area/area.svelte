<script module>
    export const title = 'Simple area';
    export const data = { aapl: '/data/aapl.csv' };
    export const sortKey = 1;
    export const repl =
        'https://svelte.dev/playground/27639afc92e84d96a11c341fa16a7e6c?version=latest';
</script>

<script lang="ts">
    import { Plot, Area } from 'svelteplot';
    import type { AaplRow } from '../types';

    let { aapl }: { aapl: AaplRow[] } = $props();
</script>

<Plot y={{ grid: true }}>
    <Area data={aapl} x1="Date" y1={0} y2="Close" />
</Plot>
