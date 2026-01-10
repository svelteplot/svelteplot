<script module>
    export const title = 'Gradient line';
    export const data = { aapl: '/data/aapl.csv' };
    export const repl =
        'https://svelte.dev/playground/7989004c109a436895de1668c0fee708?version=latest';
</script>

<script lang="ts">
    import {
        Plot,
        Line,
        LinearGradientX
    } from 'svelteplot';
    import type { AaplRow } from '../types';
    let { aapl }: { aapl: AaplRow[] } = $props();
</script>

<Plot x={{ grid: true }}>
    <defs>
        <LinearGradientX
            id="gradient-line-x"
            stops={[
                {
                    x: new Date(2014, 0, 1),
                    color: 'cyan'
                },
                {
                    x: new Date(2016, 0, 1),
                    color: 'magenta'
                },

                {
                    x: new Date(2018, 0, 1),
                    color: 'gold'
                }
            ]} />
    </defs>
    <Line
        data={aapl}
        x="Date"
        y="Close"
        stroke="url(#gradient-line-x)" />
</Plot>
