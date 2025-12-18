<script module>
    export const title = 'Tick count';
    export const data = { aapl: '/data/aapl.csv' };
    export const repl =
        'https://svelte.dev/playground/0a5a9e00b3e34fcfab657be80a818fd3?version=latest';
</script>

<script>
    import { Plot, AxisX, AxisY, Line } from 'svelteplot';
    let { aapl } = $props();
</script>

<Plot marginTop={30}>
    <AxisY tickCount={20} />
    <AxisX tickCount={2} />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
