<script module>
    export const title = 'Density lines';
    export const data = {
        iris: '/data/iris2.csv'
    };
    export const description =
        'Density plot of the measurements in the <a href="https://en.wikipedia.org/wiki/Iris_flower_data_set">Iris flower dataset</a>, showing density estimates for each measurement type.';
    export const transforms = ['density'];
    export const repl =
        'https://svelte.dev/playground/24c1d53d571b468bae67922bd8e721d7?version=latest';
</script>

<script lang="ts">
    import {
        Plot,
        densityX,
        Line,
        AreaY
    } from 'svelteplot';
    import type { Iris2Row } from '../types';
    import RuleY from 'svelteplot/marks/RuleY.svelte';

    let { iris }: { iris: Iris2Row[] } = $props();
</script>

<Plot
    color={{ legend: true }}
    y={{ label: 'Density', percent: true }}
    grid>
    <RuleY y={0} />
    <Line
        {...densityX(
            {
                data: iris,
                x: 'Value',
                stroke: 'Measurement'
            },
            { trim: true }
        )}
        strokeWidth={2}
        outlineStroke="var(--svelteplot-bg)" />
</Plot>
