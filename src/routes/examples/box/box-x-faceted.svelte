<script module>
    export const title = 'BoxX (faceted)';
    export const sortKey = 20;
    export const data = { penguins: '/data/penguins.csv' };
    export const repl =
        'https://svelte.dev/playground/1c44cb004f414d1d81f1b144237d8341';
</script>

<script lang="ts">
    import { Plot, BoxX } from 'svelteplot';
    import type { PenguinsRow } from '../types';

    let { penguins }: { penguins: PenguinsRow[] } =
        $props();
</script>

<Plot
    height={400}
    y={{ grid: true }}
    x={{ insetLeft: 5, insetRight: 5 }}>
    <BoxX
        data={penguins}
        x="flipper_length_mm"
        y="species"
        fy="sex"
        stroke="sex"
        fill="sex"
        tickMinMax
        tickMedian={{
            stroke: 'var(--svelteplot-bg)',
            strokeWidth: 3
        }} />
</Plot>
