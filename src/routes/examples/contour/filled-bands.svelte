<script module>
    export const title = 'Filled contour bands';
    export const description =
        'Filled contour bands of <a href="https://en.wikipedia.org/wiki/Maungawhau_/_Mount_Eden">Maungawhau (Mt. Eden)</a> elevation, colored by threshold level.';
    export const data = {
        volcano: '/data/volcano.json'
    };
    export const sortKey = 20;
</script>

<script lang="ts">
    import { Plot, Contour } from 'svelteplot';

    const { volcano } = $props() as {
        volcano: {
            width: number;
            height: number;
            values: number[];
        };
    };
</script>

<Plot color={{ scheme: 'turbo', legend: true }}>
    <Contour
        data={volcano.values}
        width={volcano.width}
        height={volcano.height}
        fill="value" />
</Plot>
