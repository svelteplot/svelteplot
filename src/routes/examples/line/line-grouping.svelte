<script module>
    export const title = 'Line grouping';
    export const data = { aapl: '/data/aapl.csv' };
</script>

<script lang="ts">
    import { Plot, Line } from 'svelteplot';
    import type { AaplRow } from '../types';
    let { aapl }: { aapl: AaplRow[] } = $props();
</script>

<Plot color={{ scheme: 'rainbow' }}>
    <Line
        data={aapl}
        x="Date"
        y="Close"
        stroke={(d) => d.Date.getFullYear()} />
</Plot>
