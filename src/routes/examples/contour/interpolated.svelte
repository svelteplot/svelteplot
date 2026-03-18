<script module>
    export const title = 'Interpolated contour';
    export const description =
        'Contour lines of the <a href="https://www.bgs.ac.uk/datasets/regional-geophysics-of-southwest-england/">CA55 aeromagnetic survey</a> over SW England, interpolated from scattered flight-line measurements using random-walk.';
    export const data = {
        ca55: '/data/ca55.csv'
    };
    export const sortKey = 35;
</script>

<script lang="ts">
    import { Plot, Contour, Dot } from 'svelteplot';
    import type { CA55Row } from '../types';

    const { ca55 } = $props<{ ca55: CA55Row[] }>();
</script>

<Plot color={{ type: 'diverging', legend: true }}>
    <Contour
        data={ca55}
        x="LONGITUDE"
        y="LATITUDE"
        fill="MAG_IGRF90"
        blur={2}
        stroke="none" />
    <!-- <Dot
        data={ca55}
        x="LONGITUDE"
        y="LATITUDE"
        fill="MAG_IGRF90" /> -->
</Plot>
