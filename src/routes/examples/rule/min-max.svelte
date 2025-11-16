<script module>
    export const title = 'Min/max rules';
    export const transforms = ['bin'];
</script>

<script lang="ts">
    import { Plot, Line, RuleY, binX } from 'svelteplot';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';
    let { aapl } = $derived(page.data.data) as ExamplesData;
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
