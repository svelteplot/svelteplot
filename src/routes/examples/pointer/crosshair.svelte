<script module>
    export const title = 'Crosshair';
    export const data = { aapl: '/data/aapl.csv' };
</script>

<script lang="ts">
    import {
        Plot,
        Line,
        RuleX,
        RuleY,
        AxisX,
        AxisY,
        Pointer
    } from 'svelteplot';
    let { aapl } = $props();
    const dateFmt: any = 'MMM D, YYYY';
</script>

<div style="touch-action: none">
    <Plot marginBottom={30}>
        <AxisX />
        <AxisY />
        <Line data={aapl} x="Date" y="Close" />
        <Pointer
            data={aapl}
            x="Date"
            y="Close"
            maxDistance={30}>
            {#snippet children({ data })}
                {#if data.length > 0}
                    <RuleX {data} x="Date" opacity="0.3" />
                    <RuleY {data} y="Close" opacity="0.3" />
                    <AxisX
                        data={data.map((d) => d.Date)}
                        tickFormat={dateFmt} />
                    <AxisY
                        data={data.map((d) => d.Close)}
                        tickFormat={(d) =>
                            (d as number).toFixed()} />
                {/if}
            {/snippet}
        </Pointer>
    </Plot>
</div>
