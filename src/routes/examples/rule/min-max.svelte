<script module>
    export const title = 'Min/max rules';
    export const transforms = ['bin'];
    export const data = { aapl: '/data/aapl.csv' };
</script>

<script lang="ts">
    import { Plot, Line, RuleY, binX } from 'svelteplot';
    let { aapl } = $props();
</script>

<Plot>
    <Line
        data={aapl}
        x="Date"
        y="Close"
        strokeOpacity={0.5} />
    <RuleY
        stroke="var(--svp-blue)"
        {...binX(
            {
                data: aapl,
                x: 'Date',
                y: 'Close'
            },
            { y: 'max', interval: 'year' }
        )} />
    <RuleY
        stroke="var(--svp-red)"
        {...binX(
            {
                data: aapl,
                x: 'Date',
                y: 'Close'
            },
            { y: 'min', interval: 'year' }
        )} />
</Plot>
