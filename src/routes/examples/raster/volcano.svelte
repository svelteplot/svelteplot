<script module>
    export const title = 'Volcano elevation';
    export const description =
        'A raster image of <a href="https://en.wikipedia.org/wiki/Maungawhau_/_Mount_Eden">Maungawhau (Mt. Eden)</a> in Auckland, NZ, rendered from a 87×61 dense elevation grid.';
    export const data = {
        volcano: '/data/volcano.json'
    };
</script>

<script lang="ts">
    import { Plot, Raster } from 'svelteplot';

    type VolcanoData = {
        width: number;
        height: number;
        values: number[];
    };
    const { volcano } = $props() as {
        volcano: VolcanoData;
    };
</script>

<Plot color={{ scheme: 'turbo' }}>
    <Raster
        data={volcano.values}
        width={volcano.width}
        height={volcano.height} />
</Plot>
