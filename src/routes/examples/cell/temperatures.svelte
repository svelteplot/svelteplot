<script module>
    export const title = 'Responsive cells';
    export const description =
        'A responsive cell plot that flips coordinates based on the width of the container, displaying Seattle temperatures for 2015.';
    export const repl =
        'https://svelte.dev/playground/6e1188793b71467e94308d57503c15b4?version=5.33.14';
    export const fullCode = true;
</script>

<script lang="ts">
    import { Plot, Cell, formatMonth } from 'svelteplot';

    import { page } from '$app/state';
    let { seattle } = $derived(page.data.data);

    let clientWidth = $state(500);

    // Seattle temperatures data
    const x = $derived(clientWidth < 600 ? 'y' : 'x');
    const y = $derived(clientWidth < 600 ? 'x' : 'y');
</script>

<div bind:clientWidth>
    <Plot
        padding={0}
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
                [x]: (d) => d.date.getUTCDate(),
                [y]: (d) => d.date.getUTCMonth()
            }}
            fill="temp_max"
            inset={0.5} />
    </Plot>
</div>
