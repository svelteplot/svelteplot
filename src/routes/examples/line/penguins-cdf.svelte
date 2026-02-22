<script module>
    export const title = 'Cumulative distribution';
    export const data = { penguins: '/data/penguins.csv' };
    export const description =
        '<a href="https://en.wikipedia.org/wiki/Cumulative_distribution_function">Cumulative distribution</a> of body mass in the Palmer penguins dataset, one curve per species.';
    export const transforms = ['density'];
</script>

<script lang="ts">
    import { Plot, Line, densityX } from 'svelteplot';
    import type { PenguinsRow } from '../types';

    let { penguins }: { penguins: PenguinsRow[] } =
        $props();
</script>

<Plot
    grid
    y={{
        ticks: [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1],
        percent: true
    }}
    color={{ legend: true }}>
    <Line
        {...densityX(
            {
                data: penguins,
                x: 'body_mass_g',
                stroke: 'species'
            },
            { cumulative: true, trim: false }
        )}
        strokeWidth={2} />
</Plot>
