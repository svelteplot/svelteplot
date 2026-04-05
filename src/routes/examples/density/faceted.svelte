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
    import { useDark } from '$shared/ui';

    const ds = useDark();

    const { penguins } = $props<{
        penguins: PenguinsRow[];
    }>();
</script>

<Plot
    inset={20}
    frame
    color={{ scheme: ds.isDark ? 'viridis' : 'blues' }}>
    <Density
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="density"
        thresholds={8}
        fx="species" />
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        r={1}
        fill={ds.isDark ? 'white' : 'black'}
        opacity={0.6}
        fx="species" />
</Plot>
