<script module>
    export const title = 'Parallel coordinates (3)';
    export const description =
        'Parallel coordinate plot for the <a href="https://en.wikipedia.org/wiki/Iris_flower_data_set">Iris flower dataset</a>, scaled to the standard deviation of each variable with one species highlighted. Inspired by the  <a href="https://r-graph-gallery.com/parallel-plot-ggally.html#custom">ggparcoord example</a> in R.';
    export const data = { iris: '/data/iris2.csv' };
    export const sortKey = 103;
    export const transforms = ['normalize'];
    export const repl =
        'https://svelte.dev/playground/0d61b0f03edd454283f0f105b2a30875?version=5';
</script>

<script lang="ts">
    import {
        Plot,
        Line,
        normalizeParallelY
    } from 'svelteplot';
    import type { Iris2Row } from '../types';
    import Select from '$shared/ui/Select.svelte';

    let { iris }: { iris: Iris2Row[] } = $props();

    let highlight = $state('setosa');
</script>

<Plot
    grid
    height={450}
    inset={10}
    y={{ label: 'Standard deviation' }}
    color={{
        legend: true,
        // legend item order
        domain: [highlight, 'others'],
        scheme: highlight
            ? {
                  [highlight]: 'var(--svp-blue)',
                  others: '#99999922'
              }
            : undefined
    }}>
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
        stroke={(d) =>
            /* show non-highlighted species in gray */
            d.Species === highlight ? d.Species : 'others'}
        sort={(d) =>
            /* make sure highlighted species are on top */
            d.Species === highlight ? 1 : -1}
        marker="dot" />
</Plot>
<Select
    bind:value={highlight}
    label="Highlight species"
    options={['setosa', 'versicolor', 'virginica']} />
