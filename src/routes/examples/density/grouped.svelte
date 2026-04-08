<script module>
    export const title = 'Grouped density isolines';
    export const description =
        'Two-dimensional kernel density estimate of penguin bill dimensions, grouped and colored by species.';
    export const data = {
        penguins: '/data/penguins.csv'
    };
    export const sortKey = 40;
</script>

<script lang="ts">
    import { Plot, Density } from 'svelteplot';
    import type { PenguinsRow } from '../types';

    const { penguins } = $props<{
        penguins: PenguinsRow[];
    }>();
</script>

<Plot>
    <Density
        data={penguins}
        stroke="species"
        x="culmen_length_mm"
        y="culmen_depth_mm" />
</Plot>
