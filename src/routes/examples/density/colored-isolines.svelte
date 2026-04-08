<script module>
    export const title = 'Colored density isolines';
    export const description =
        'Two-dimensional kernel density estimate of penguin bill dimensions, with isolines colored by density level using the Viridis color scheme.';
    export const data = {
        penguins: '/data/penguins.csv'
    };
    export const sortKey = 15;
</script>

<script lang="ts">
    import { Plot, Density } from 'svelteplot';
    import type { PenguinsRow } from '../types';

    const { penguins } = $props<{
        penguins: PenguinsRow[];
    }>();
</script>

<Plot color={{ scheme: 'viridis', legend: true }}>
    <Density
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="density"
        thresholds={15} />
</Plot>
