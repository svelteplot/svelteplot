<script module>
    export const title = 'Clipped grid lines';
    export const description =
        'You can use an area mark as clipping path for grid lines';
</script>

<script>
    import {
        Plot,
        AreaY,
        Line,
        GridX,
        RuleY
    } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
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
