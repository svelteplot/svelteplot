<script module>
    export const title = 'Parallel coordinates (2)';
    export const description =
        'Parallel coordinate plot for the classic <a href="https://en.wikipedia.org/wiki/Iris_flower_data_set">Iris flower dataset</a>, scaled to the extent to each variable, inspired by the <a href="https://r-graph-gallery.com/parallel-plot-ggally.html#custom">ggparcoord example</a> in R.';
    export const data = { iris: '/data/iris2.csv' };
    export const sortKey = 102;
    export const transforms = ['normalize'];
    export const repl =
        'https://svelte.dev/playground/560d60d41f794ee58222d75e3fd132af?version=latest';
</script>

<script lang="ts">
    import {
        Plot,
        Line,
        normalizeParallelX
    } from 'svelteplot';
    import type { Iris2Row } from '../types';

    let { iris }: { iris: Iris2Row[] } = $props();
</script>

<Plot grid height={450} inset={10} color={{ legend: true }}>
    <Line
        {...normalizeParallelX(
            {
                data: iris,
                x: 'Value',
                y: 'Measurement',
                z: 'Id'
            },
            'extent'
        )}
        curve="monotone-y"
        strokeOpacity={0.3}
        stroke="Species"
        marker="dot" />
</Plot>
