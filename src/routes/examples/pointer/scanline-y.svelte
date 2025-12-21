<script module>
    export const title = 'Scanline Y';
    export const data = { aapl: '/data/aapl.csv' };
</script>

<script lang="ts">
    import {
        Plot,
        Line,
        RuleY,
        Dot,
        Text,
        Pointer
    } from 'svelteplot';
    let { aapl } = $props();
</script>

<Plot marginRight={20}>
    <Line data={aapl} x="Date" y="Close" opacity={0.6} />
    <Pointer
        data={aapl}
        y="Close"
        maxDistance={30}
        tolerance={0.5}>
        {#snippet children({ data })}
            <RuleY {data} y="Close" opacity={0.2} />
            <Text
                {data}
                fill="currentColor"
                stroke="var(--svelteplot-bg)"
                strokeWidth={3}
                y="Close"
                text={(d) => d.Close.toFixed()}
                lineAnchor="middle"
                textAnchor="end"
                dx={-5}
                frameAnchor="left"
                fontWeight="bold" />
            <Dot {data} x="Date" y="Close" fill r={3} />
        {/snippet}
    </Pointer>
</Plot>
