<script module>
    export const title = 'Crop grid x lines to data';
    export const description =
        'Use x1 and x2 channels to let grid lines stop at a data value';
    export const data = { aapl: '/data/aapl.csv' };
    export const repl =
        'https://svelte.dev/playground/50fe3ab6444d4daf9f9a2805a9ff9828?version=latest';
</script>

<script>
    import { Plot, Line, GridY } from 'svelteplot';
    let { aapl } = $props();
</script>

<Plot>
    <GridY
        x1={aapl[0].Date}
        x2={(value) =>
            aapl.find((d) => Math.abs(d.Close - value) < 1)
                ?.Date} />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
