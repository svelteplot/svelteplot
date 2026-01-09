<script module>
    export const title = 'Indexed stocks';
    export const description =
        'Line plot of stock prices normalized to various basis (first, last, min, max, mean, median, sum, deviation, extent).';
    export const data = {
        tech7: '/data/tech7.csv'
    };
    export const sortKey = 10;
    export const transforms = ['normalize'];
    export const repl =
        'https://svelte.dev/playground/2cef2e079ab34d429be7fad6ac289635?version=latest';
</script>

<script>
    import {
        Plot,
        Line,
        RuleY,
        normalizeY
    } from 'svelteplot';
    let { tech7 } = $props();
</script>

<Plot
    color={{ legend: true }}
    y={{ grid: true, percent: true }}>
    <RuleY y={1} />
    <Line
        outlineStroke="var(--svelteplot-bg)"
        markerEnd="dot"
        curve="monotone-x"
        {...normalizeY(
            {
                data: tech7,
                x: 'date',
                y: 'adj_close',
                stroke: 'symbol'
            },
            'first'
        )} />
</Plot>
