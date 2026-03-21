<script module>
    export const title = 'Filled density bands';
    export const description =
        'Two-dimensional kernel density estimate of penguin bill dimensions, with contour bands filled by density level using a sequential color scale.';
    export const data = {
        penguins: '/data/penguins.csv'
    };
    export const sortKey = 20;
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
        thresholds={10} />
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fill="white"
        r={1.5}
        opacity={0.5} />
</Plot>
