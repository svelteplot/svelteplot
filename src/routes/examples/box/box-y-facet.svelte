<script module>
    export const title = 'BoxY (faceted)';
    export const sortKey = 20;
    export const data = { penguins: '/data/penguins.csv' };
    export const repl =
        'https://svelte.dev/playground/11103eb6e5f1441ab6533b2e204001b1?version=latest';
</script>

<script lang="ts">
    import { Plot, BoxY } from 'svelteplot';
    import type { PenguinsRow } from '../types';

    let { penguins }: { penguins: PenguinsRow[] } =
        $props();
</script>

<Plot grid>
    <BoxY
        data={penguins}
        x="species"
        y="flipper_length_mm"
        fill="species"
        fx="sex"
        tickMinMax
        tickMedian={{
            stroke: 'var(--svelteplot-bg)',
            strokeWidth: 3
        }} />
</Plot>
