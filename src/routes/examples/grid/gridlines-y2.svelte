<script module>
    export const title = 'Crop grid lines to range';
    export const description =
        'You can use an area mark as clipping path for grid lines';
    export const data = { aapl: '/data/aapl.csv' };
</script>

<script lang="ts">
    import {
        Plot,
        AreaY,
        Line,
        GridX,
        RuleY
    } from 'svelteplot';
    let { aapl } = $props() as { aapl: any[] };
</script>

<Plot>
    <GridX
        strokeOpacity={1}
        strokeDasharray="1,2"
        y1={0}
        y2={(date) =>
            aapl
                .map((d: any) => ({
                    value: d.Close,
                    date: d.Date,
                    diff: Math.abs(
                        d.Date - (date as number)
                    )
                }))
                .sort(
                    (a: any, b: any) => a.diff - b.diff
                )[0].value} />
    <Line data={aapl} x="Date" y="Close" />
    <RuleY data={[0]} />
</Plot>
