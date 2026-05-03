<script module>
    export const title =
        'Coarser bins with custom binWidth';
    export const description =
        'binWidth controls the hex cell pitch in pixels. Larger cells aggregate more points per bin and emphasize density gradients over a backdrop grid.';
    export const data = {
        olympians: '/data/olympians.csv'
    };
    export const sortKey = 30;
</script>

<script lang="ts">
    import { Plot, Hexbin, Hexgrid } from 'svelteplot';
    import type { OlympiansRow } from '../types';

    const { olympians } = $props<{
        olympians: OlympiansRow[];
    }>();
</script>

<Plot grid color={{ scheme: 'warm' }}>
    <Hexgrid binWidth={32} />
    <Hexbin
        data={olympians}
        x="weight"
        y="height"
        fill="count"
        binWidth={32} />
</Plot>
