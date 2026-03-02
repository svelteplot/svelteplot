<script module>
    export const title = 'Interpolated raster';
    export const description =
        'A raster image of <a href="https://en.wikipedia.org/wiki/Maungawhau_/_Mount_Eden">Maungawhau (Mt. Eden)</a> in Auckland, NZ, rendered from a 87×61 dense elevation grid.';
    export const data = {
        ca55: '/data/ca55.csv'
    };
    export const sortKey = 50;
</script>

<script lang="ts">
    import { Plot, Raster } from 'svelteplot';
    import type { CA55Row } from '../types';

    const { ca55 } = $props<{ ca55: CA55Row[] }>();
</script>

<Plot color={{ type: 'diverging', legend: true }}>
    <Raster
        data={ca55}
        x="LONGITUDE"
        y="LATITUDE"
        interpolate="random-walk"
        blur={5}
        fill="MAG_IGRF90" />
</Plot>
