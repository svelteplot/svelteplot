<script module>
    export const title = 'Clipped grid lines';
    export const description =
        'You can use an area mark as clipping path for grid lines';
    export const data = { aapl: '/data/aapl.csv' };
</script>

<script>
    import {
        Plot,
        AreaY,
        Line,
        GridX,
        RuleY
    } from 'svelteplot';
    let { aapl } = $props();
</script>

<Plot>
    <clipPath id="grid-clip">
        <AreaY data={aapl} x="Date" y="Close" />
    </clipPath>
    <g clip-path="url(#grid-clip)">
        <GridX strokeOpacity={1} strokeDasharray="1,2" />
    </g>
    <Line data={aapl} x="Date" y="Close" />
    <RuleY data={[0]} />
</Plot>
