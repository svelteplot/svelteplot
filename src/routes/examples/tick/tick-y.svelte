<script module>
    export const title = 'TickY';
</script>

<script>
    import { Plot, RuleY, TickY } from 'svelteplot';
    import { page } from '$app/state';
    let { stateage } = $derived(page.data.data);
</script>

<Plot y={{ grid: true, percent: true }}>
    <RuleY data={[0]} />
    <TickY data={stateage} x="age" y="pop_share" />
</Plot>
