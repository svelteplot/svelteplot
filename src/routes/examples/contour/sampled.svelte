<script module>
    export const title = 'Sampled contour';
    export const description =
        'Filled contour bands of a sin·cos function, evaluated on a pixel grid using function-sampling mode.';
    export const sortKey = 30;
</script>

<script lang="ts">
    import { Plot, Contour } from 'svelteplot';
</script>

<Plot
    color={{
        type: 'diverging',
        legend: true
    }}
    aspectRatio={1}>
    <Contour
        fill={(x: number, y: number) =>
            Math.sin(x) * Math.cos(y)}
        x1={0}
        x2={6 * Math.PI}
        y1={0}
        y2={4 * Math.PI} />
</Plot>
