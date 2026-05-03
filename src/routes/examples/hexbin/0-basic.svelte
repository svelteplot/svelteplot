<script module>
    export const title = 'Olympians weight × height';
    export const description =
        'Hexagonal binning of Olympic athletes by weight and height; cell color encodes count. Pixel-space lattice keeps cells regular under any axis aspect ratio.';
    export const data = {
        olympians: '/data/olympians.csv'
    };
    export const sortKey = 10;
</script>

<script lang="ts">
    import { Plot, Hexbin } from 'svelteplot';
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
</Plot>
