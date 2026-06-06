<script module lang="ts">
    export const title = 'Voronoi (penguins)';
    export const description =
        'Voronoi cells colored by penguin species, showing which region of the scatterplot is closest to each species.';
    export const data = { penguins: '/data/penguins.csv' };
</script>

<script lang="ts">
    import { Plot, Voronoi, Dot, Frame } from 'svelteplot';
    import type { PenguinsRow } from '../types';

    let { penguins }: { penguins: PenguinsRow[] } =
        $props();
</script>

<Plot>
    <Voronoi
        data={penguins}
        x="bill_length_mm"
        y="bill_depth_mm"
        fill="species"
        fillOpacity={0.3}
        stroke="var(--svelteplot-bg)" />
    <Dot
        data={penguins}
        x="bill_length_mm"
        y="bill_depth_mm"
        fill="species"
        r={2} />
    <Frame />
</Plot>
