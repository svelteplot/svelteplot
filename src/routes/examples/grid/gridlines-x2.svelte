<script module>
    export const title = 'Crop grid x lines to data';
    export const description =
        'Use x1 and x2 channels to let grid lines stop at a data value';
    export const data = { aapl: '/data/aapl.csv' };
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
