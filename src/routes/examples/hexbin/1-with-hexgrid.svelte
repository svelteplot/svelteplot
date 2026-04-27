<script module>
    export const title = 'Hexbin paired with Hexgrid';
    export const description =
        'Hexbin and Hexgrid both default to binWidth=20 (px); a default pair tiles the same lattice without coordination, so colored cells sit exactly inside grid cells.';
    export const data = {
        olympians: '/data/olympians.csv'
    };
    export const sortKey = 20;
</script>

<script lang="ts">
    import { Plot, Hexbin, Hexgrid } from 'svelteplot';
    import type { OlympiansRow } from '../types';

    const { olympians } = $props<{
        olympians: OlympiansRow[];
    }>();
</script>

<Plot grid color={{ scheme: 'ylgnbu' }}>
    <Hexbin
        data={olympians}
        x="weight"
        y="height"
        fill="count" />
    <Hexgrid />
</Plot>
