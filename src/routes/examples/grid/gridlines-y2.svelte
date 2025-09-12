<script module>
    export const title = 'Crop grid lines to range';
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
    import { d } from 'svelte-highlight/languages';
    let { aapl } = $derived(page.data.data);
</script>

<Plot>
    <GridX
        strokeOpacity={1}
        strokeDasharray="1,2"
        y1={0}
        y2={(date) =>
            aapl
                .map((d) => ({
                    value: d.Close,
                    date: d.Date,
                    diff: Math.abs(d.Date - date)
                }))
                .sort((a, b) => a.diff - b.diff)[0]
                .value} />
    <Line data={aapl} x="Date" y="Close" />
    <RuleY data={[0]} />
</Plot>
