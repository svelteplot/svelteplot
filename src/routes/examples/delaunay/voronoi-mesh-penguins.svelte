<script module lang="ts">
    export const title = 'Voronoi mesh (penguins)';
    export const description =
        'A lightweight Voronoi mesh rendered as a single path, overlaid on a penguin scatterplot.';
    export const data = { penguins: '/data/penguins.csv' };
</script>

<script lang="ts">
    import { Plot, VoronoiMesh, Dot } from 'svelteplot';
    import type { PenguinsRow } from '../types';

    let { penguins }: { penguins: PenguinsRow[] } =
        $props();
</script>

<Plot>
    <VoronoiMesh
        data={penguins}
        x="bill_length_mm"
        y="culmen_depth_mm"
        strokeOpacity={0.3} />
    <Dot
        data={penguins}
        x="bill_length_mm"
        y="culmen_depth_mm"
        fill="species"
        r={3} />
</Plot>
