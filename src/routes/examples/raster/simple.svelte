<script module>
    export const title = 'Simple raster';
    export const description = '.';
</script>

<script lang="ts">
    import { range } from 'd3-array';

    import { Plot, Raster, Text } from 'svelteplot';
    import { RAW_VALUE } from 'svelteplot/transforms/recordize';

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
