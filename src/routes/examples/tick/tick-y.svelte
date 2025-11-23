<script module>
    export const title = 'TickY';
    export const data = { stateage: '/data/stateage.csv' };
</script>

<script>
    import { Plot, RuleY, TickY } from 'svelteplot';
    let { stateage } = $props();
</script>

<Plot y={{ grid: true, percent: true }}>
    <RuleY data={[0]} />
    <TickY data={stateage} x="age" y="pop_share" />
</Plot>
