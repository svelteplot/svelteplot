<script module>
    export const title = 'IGRF90 survey dots';
    export const description =
        'A line rendering of CA55 elevation dots, colored by MAG_IGRF90 magnitude. Based on this <a href="https://observablehq.com/@observablehq/plot-igrf90-dots">example</a> from Observable Plot.';
    export const data = {
        ca55: '/data/ca55.csv'
    };
    export const sortKey = 50;
</script>

<script lang="ts">
    import { Plot, Line, Dot } from 'svelteplot';
    import type { CA55Row } from '../types';

    const { ca55 } = $props<{ ca55: CA55Row[] }>();
</script>

<Plot color={{ type: 'diverging', legend: true }}>
    <Dot
        data={ca55}
        x="LONGITUDE"
        y="LATITUDE"
        fill="MAG_IGRF90" />
</Plot>
