<script module>
    export const title = 'Threshold scale';
    export const description =
        'A responsive cell plot that flips coordinates based on the width of the container, displaying Seattle temperatures for 2015. Based on an example from <a href="https://observablehq.com/@observablehq/plot-seattle-temperature-heatmap">Observable Plot</a>.';
    export const repl =
        'https://svelte.dev/playground/6e1188793b71467e94308d57503c15b4?version=5.33.14';
    export const fullCode = true;
    export const data = { seattle: '/data/seattle.csv' };
</script>

<script lang="ts">
    import { Plot, Cell, formatMonth } from 'svelteplot';
    import type { SeattleRow } from '../types';

    let { seattle }: { seattle: SeattleRow[] } = $props();

    let clientWidth = $state(500);

    // Flip x and y axes based on container width: for narrow containers, use 'y' for horizontal and 'x' for vertical to improve readability.
    const x = $derived(clientWidth < 600 ? 'y' : 'x');
    const y = $derived(clientWidth < 600 ? 'x' : 'y');
</script>

<div bind:clientWidth>
    <Plot
        padding={0}
        color={{
            scheme: 'OrRd',
            type: 'threshold',
            domain: [15, 17, 19, 20, 25, 30],
            legend: true
        }}
        aspectRatio={clientWidth < 600 ? 2 : 1}
        {...{
            [y]: {
                ticks: [
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
                ],
                tickFormat: formatMonth('en', 'short'),
                axis: clientWidth < 600 ? 'both' : 'left'
            }
        }}>
        <Cell
            data={seattle}
            filter={(d) => d.date.getUTCFullYear() === 2015}
            {...{
                [x]: (d: SeattleRow) => d.date.getUTCDate(),
                [y]: (d: SeattleRow) => d.date.getUTCMonth()
            }}
            fill="temp_max"
            inset={0.5} />
    </Plot>
</div>
