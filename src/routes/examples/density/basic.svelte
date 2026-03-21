<script module>
    export const title = 'Density isolines';
    export const description =
        'Two-dimensional kernel density estimate of penguin bill dimensions, shown as contour isolines.';
    export const data = {
        penguins: '/data/penguins.csv'
    };
    export const sortKey = 10;
</script>

<script lang="ts">
    import { Plot, Density, Dot } from 'svelteplot';
    import type { PenguinsRow } from '../types';

    const { penguins } = $props<{
        penguins: PenguinsRow[];
    }>();
</script>

<Plot>
    <Density
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        thresholds={12} />
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        r={1.5}
        opacity={0.4} />
</Plot>
