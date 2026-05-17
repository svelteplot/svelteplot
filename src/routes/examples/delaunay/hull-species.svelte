<script module lang="ts">
    export const title = 'Hull (penguins by species)';
    export const description =
        'Convex hulls drawn around each penguin species cluster, with fill and stroke colored by species.';
    export const data = { penguins: '/data/penguins.csv' };
</script>

<script lang="ts">
    import { Plot, Hull, Dot } from 'svelteplot';
    import type { PenguinsRow } from '../types';

    let { penguins }: { penguins: PenguinsRow[] } =
        $props();
</script>

<Plot grid>
    <Hull
        data={penguins}
        x="bill_length_mm"
        y="culmen_depth_mm"
        stroke="species"
        fill="species"
        fillOpacity={0.1}
        strokeWidth={2} />
    <Dot
        data={penguins}
        x="bill_length_mm"
        y="culmen_depth_mm"
        fill="species"
        r={3} />
</Plot>
