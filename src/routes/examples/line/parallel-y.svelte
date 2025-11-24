<script module>
    export const title = 'Parallel coordinates (1)';
    export const description =
        'Parallel coordinate plot for the classic <a href="https://en.wikipedia.org/wiki/Iris_flower_data_set">Iris flower dataset</a>, scaled to the standard deviation of each variable. Inspired by the  <a href="https://r-graph-gallery.com/parallel-plot-ggally.html#custom">ggparcoord example</a> in R.';
    export const data = { iris: '/data/iris.csv' };
    export const repl =
        'https://svelte.dev/playground/e328626124904a89a0ddbe8a3816a7af?version=5';
    export const sortKey = 101;
    export const transforms = ['normalize'];
</script>

<script lang="ts">
    import {
        Plot,
        Line,
        normalizeParallelY
    } from 'svelteplot';
    import type { IrisRow } from '../types';

    let { iris }: { iris: IrisRow[] } = $props();
</script>

<Plot
    grid
    height={450}
    inset={10}
    y={{ label: 'Standard deviation' }}
    color={{ legend: true }}>
    <Line
        {...normalizeParallelY(
            {
                data: iris,
                x: 'Measurement',
                y: 'Value',
                z: 'Id'
            },
            'deviation'
        )}
        strokeOpacity={0.5}
        stroke="Species"
        marker="dot" />
</Plot>
