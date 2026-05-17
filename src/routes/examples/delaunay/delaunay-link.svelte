<script module lang="ts">
    export const title = 'Delaunay link';
    export const description =
        'Individual Delaunay edges colored by body mass, showing connections between neighboring penguins in the scatterplot.';
    export const data = { penguins: '/data/penguins.csv' };
</script>

<script lang="ts">
    import { Plot, DelaunayLink, Dot } from 'svelteplot';
    import type { PenguinsRow } from '../types';

    let { penguins }: { penguins: PenguinsRow[] } =
        $props();
</script>

<Plot grid color={{ legend: true }}>
    <DelaunayLink
        data={penguins}
        x="bill_length_mm"
        y="culmen_depth_mm"
        stroke="body_mass_g"
        strokeOpacity={0.55} />
    <Dot
        data={penguins}
        x="bill_length_mm"
        y="culmen_depth_mm"
        fill
        r={2} />
</Plot>
