<script lang="ts">
    import { Plot, BarY, RuleY } from 'svelteplot';

    import { page } from '$app/stores';
    let { alphabet } = $derived($page.data.data);
</script>

<Plot grid y={{ percent: true }} marginTop={25}>
    <RuleY data={[0]} />
    <BarY data={alphabet} x="letter" y="frequency" />
</Plot>
