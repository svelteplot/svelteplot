<script module>
    export const title = 'Barcode plot';
    export const description = `Based on an example from <a href="https://observablehq.com/@observablehq/plot-barcode">Observable Plot</a>, this chart shows the age distribution of the population in each US state as horizontal ticks. The x position of each tick represents the share of the state's population in that age group.`;
    export const data = { stateage: '/data/stateage.csv' };
</script>

<script>
    import { Plot, RuleX, TickX } from 'svelteplot';
    let { stateage } = $props();
</script>

<Plot
    x={{ grid: true, percent: true }}
    y={{
        // in age order
        domain: [...new Set(stateage.map((d) => d.age))]
    }}>
    <RuleX data={[0]} />
    <TickX data={stateage} y="age" x="pop_share" />
</Plot>
