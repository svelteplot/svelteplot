<script module>
    export const title = 'Sampled raster';
    export const description =
        'A raster image of <a href="https://en.wikipedia.org/wiki/Maungawhau_/_Mount_Eden">Maungawhau (Mt. Eden)</a> in Auckland, NZ, rendered from a 87×61 dense elevation grid.';

    export const sortKey = 55;
</script>

<script lang="ts">
    import { Plot, Raster } from 'svelteplot';

    function mandelbrot(x: number, y: number) {
        for (let n = 0, zr = 0, zi = 0; n < 80; ++n) {
            [zr, zi] = [
                zr * zr - zi * zi + x,
                2 * zr * zi + y
            ];
            if (zr * zr + zi * zi > 4) return n;
        }
    }
</script>

<Plot
    color={{ scheme: 'turbo', domain: [0, 100] }}
    aspectRatio={1}>
    <Raster
        fill={mandelbrot}
        x1={-2}
        x2={1}
        y1={-1.164}
        y2={1.164} />
</Plot>
