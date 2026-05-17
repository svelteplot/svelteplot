<script module lang="ts">
    export const title = 'Delaunay mesh (penguins)';
    export const description =
        'The full Delaunay triangulation rendered as a single path over a penguin scatterplot.';
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
        y="culmen_depth_mm"
        strokeOpacity={0.3} />
    <Dot
        data={penguins}
        x="bill_length_mm"
        y="culmen_depth_mm"
        fill="species"
        r={3} />
</Plot>
