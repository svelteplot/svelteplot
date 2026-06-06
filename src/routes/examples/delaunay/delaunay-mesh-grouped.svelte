<script module lang="ts">
    export const title = 'Delaunay mesh grouped by species';
    export const description =
        'Separate Delaunay triangulations per penguin species using the z channel.';
    export const data = { penguins: '/data/penguins.csv' };
</script>

<script lang="ts">
    import { Plot, DelaunayMesh, Dot } from 'svelteplot';
    import type { PenguinsRow } from '../types';

    let { penguins }: { penguins: PenguinsRow[] } =
        $props();
</script>

<Plot grid>
    <DelaunayMesh
        data={penguins}
        x="bill_length_mm"
        y="bill_depth_mm"
        stroke="species"
        z="species"
        strokeOpacity={0.7} />
    <Dot
        data={penguins}
        x="bill_length_mm"
        y="bill_depth_mm"
        fill="species"
        r={3} />
</Plot>
