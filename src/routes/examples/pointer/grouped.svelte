<script module>
    export const title = 'Grouped pointer tooltips';
    export const data = { stocks: '/data/stocks.csv' };
</script>

<script lang="ts">
    import {
        Plot,
        Line,
        RuleX,
        Dot,
        Text,
        Pointer
    } from 'svelteplot';
    let { stocks } = $props();
    let stocks2 = $derived(
        stocks.filter((d) => d.Date < new Date(2018, 0, 1))
    );
    let sel = $state([]);
</script>

<Plot
    y={{ type: 'log', grid: true }}
    color={{ legend: true }}
    marginRight={20}>
    <Line
        data={stocks2}
        x="Date"
        opacity={sel.length > 0 ? 0.4 : 1}
        y="Close"
        stroke="Symbol" />
    <Pointer
        data={stocks2}
        x="Date"
        z="Symbol"
        onupdate={(e) => (sel = e)}
        maxDistance={30}>
        {#snippet children({ data })}
            <Text
                {data}
                fill="Symbol"
                stroke="var(--svelteplot-bg)"
                strokeWidth={3}
                x="Date"
                y="Close"
                text={(d) => d.Close.toFixed()}
                lineAnchor="bottom"
                fontWeight="bold"
                dy={-3} />
            <Dot
                {data}
                x="Date"
                y="Close"
                fill="Symbol"
                strokeWidth={0.7}
                stroke="var(--svelteplot-bg)" />
        {/snippet}
    </Pointer>
</Plot>
