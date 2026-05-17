<script module>
    export const title = 'Sampled raster';
    export const description =
        'The <a href="https://en.wikipedia.org/wiki/Mandelbrot_set">Mandelbrot set</a> rendered by sampling a function — the Raster mark calls <code>fill(x, y)</code> for each pixel and maps the iteration count to a color scale.';

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
