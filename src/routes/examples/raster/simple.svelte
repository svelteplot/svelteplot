<script module>
    export const title = 'Simple raster';
    export const description =
        'A minimal 10x10 raster rendered from a flat numeric array, with each cell value overlaid as text.';
</script>

<script lang="ts">
    import { range } from 'd3-array';

    import { Plot, Raster, Text } from 'svelteplot';

    const width = 10;
    const height = 10;
    const values = range(width).flatMap((x) =>
        range(height).map((y) => x * y)
    );
</script>

<Plot
    x={{ domain: [0, width] }}
    y={{ domain: [0, height] }}
    color={{ scheme: 'turbo', legend: true }}>
    <Raster
        data={values}
        {width}
        {height}
        imageRendering="pixelated" />
    <Text
        data={values}
        fill="white"
        text={(d) => String(d)}
        x={(d, i) => (i % width) + 0.5}
        y={(d, i) => Math.floor(i / width) + 0.5} />
</Plot>
