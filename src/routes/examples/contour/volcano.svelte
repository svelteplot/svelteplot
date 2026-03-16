<script module>
    export const title = 'Volcano contours';
    export const description =
        'Contour lines of <a href="https://en.wikipedia.org/wiki/Maungawhau_/_Mount_Eden">Maungawhau (Mt. Eden)</a> in Auckland, NZ, derived from an 87×61 dense elevation grid.';
    export const data = {
        volcano: '/data/volcano.json'
    };
    export const sortKey = 10;
</script>

<script lang="ts">
    import { Plot, Contour } from 'svelteplot';

    const { volcano } = $props() as {
        volcano: { width: number; height: number; values: number[] };
    };
</script>

<Plot color={{ scheme: 'turbo', legend: true }}>
    <Contour
        data={volcano.values}
        width={volcano.width}
        height={volcano.height}
        stroke="value" />
</Plot>
