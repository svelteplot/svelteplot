<script module>
    export const title = 'Tick interval';
    export const data = { aapl: '/data/aapl.csv' };
    export const repl =
        'https://svelte.dev/playground/c499a53e132d45648ea40cefef57370f?version=latest';
</script>

<script>
    import { Plot, AxisX, AxisY, Line } from 'svelteplot';
    let { aapl } = $props();
</script>

<Plot>
    <AxisX interval="6 months" />
    <AxisY interval={25} />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
