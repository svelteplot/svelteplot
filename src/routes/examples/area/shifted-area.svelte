<script module>
    export const title = 'Shifted area';
    export const description =
        'An area plot with the area shifted up and down along the y-axis.';
    export const transforms = ['shift'];
    export const data = { aapl: '/data/aapl.csv' };
    export const repl =
        'https://svelte.dev/playground/51d7711302964d5282e756346b639d84?version=latest';
</script>

<script lang="ts">
    import { Plot, Line, AreaY, shiftY } from 'svelteplot';
    import type { AaplRow } from '../types';
    let { aapl }: { aapl: AaplRow[] } = $props();
</script>

<Plot y={{ grid: true }}>
    <Line data={aapl} x="Date" y="Close" />
    <AreaY
        {...shiftY(
            { data: aapl, x: 'Date', y: 'Close' },
            { y1: -10, y2: +10 }
        )}
        fill="red"
        opacity="0.2" />
</Plot>
