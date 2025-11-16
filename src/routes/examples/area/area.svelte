<script module>
    export const title = 'Simple area';
</script>

<script lang="ts">
    import { Plot, Area } from 'svelteplot';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';
    let { aapl } = $derived(page.data.data) as ExamplesData;
</script>

<Plot y={{ grid: true }}>
    <Area data={aapl} x1="Date" y1={0} y2="Close" />
</Plot>
