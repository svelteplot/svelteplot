<script module lang="ts">
    export const title = 'Year-over-year differences';
    export const description =
        'Apple stock price compared to a shifted copy of itself to show year-over-year differences. Based on an example from <a href="https://observablehq.com/plot/transforms/shift">Observable Plot</a>.';
    export const transforms = ['shift'];
    export const data = { aapl: '/data/aapl.csv' };
    export const repl =
        'https://svelte.dev/playground/10e29cfee48a48dc8e793d37909849e2?version=latest';
</script>

<script lang="ts">
    import { Plot, DifferenceY, shiftX } from 'svelteplot';
    let { aapl } = $props();
</script>

<Plot height={350} grid>
    <DifferenceY
        stroke
        {...shiftX(
            { data: aapl, x: 'Date', y: 'Close' },
            { x1: `+365 days` }
        )}
        positiveFill="var(--svp-green)"
        negativeFill="var(--svp-red)" />
</Plot>
