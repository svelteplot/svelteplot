<script module>
    export const title = 'TickX';
</script>

<script>
    import { Plot, RuleX, TickX } from 'svelteplot';
    import { page } from '$app/state';
    let { stateage } = $derived(page.data.data);
</script>

<Plot x={{ grid: true, percent: true }}>
    <RuleX data={[0]} />
    <TickX data={stateage} y="age" x="pop_share" />
</Plot>
