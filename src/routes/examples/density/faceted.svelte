<script module>
    export const title = 'Faceted density';
    export const description =
        'Two-dimensional kernel density estimate of penguin bill dimensions, faceted by species. Thresholds are derived from the global density maximum for a consistent color scale across panels.';
    export const data = {
        penguins: '/data/penguins.csv'
    };
    export const sortKey = 30;
</script>

<script lang="ts">
    import { Plot, Density, Dot } from 'svelteplot';
    import type { PenguinsRow } from '../types';

    const { penguins } = $props<{
        penguins: PenguinsRow[];
    }>();
</script>

<Plot color={{ scheme: 'blues', legend: true }}>
    <Density
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fill="density"
        stroke="none"
        thresholds={8}
        fy="species" />
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fill="species"
        r={2}
        opacity={0.6}
        fy="species" />
</Plot>
