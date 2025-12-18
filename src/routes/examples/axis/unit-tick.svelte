<script module>
    export const title = 'Unit label tick format';
    export const data = { aapl: '/data/aapl.csv' };
    export const repl =
        'https://svelte.dev/playground/df7b2c9ec47844e686a12926b10b0ac2?version=latest';
</script>

<script>
    import { Plot, AxisX, AxisY, Line } from 'svelteplot';
    let { aapl } = $props();
</script>

<Plot
    y={{
        tickFormat: (d, i, ticks) =>
            `${d}${i === ticks.length - 1 ? ' USD' : ''}`
    }}>
    <Line data={aapl} x="Date" y="Close" />
</Plot>
