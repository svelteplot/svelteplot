<script module>
    export const title = 'Elevation profile';
    export const description =
        'While the x scale of a line chart often represents time, this is not required. For example, we can plot the elevation profile of a Tour de France stage.';
</script>

<script lang="ts">
    import { Plot, Line, RuleY } from 'svelteplot';
    import { page } from '$app/state';
    let { tdf } = $derived(page.data.data);
</script>

<Plot
    x={{ label: 'Distance from stage start (km)' }}
    y={{
        grid: true,
        interval: 100,
        label: 'Elevation (m)'
    }}>
    <Line data={tdf} x="distance" y="elevation" />
    <RuleY y={0} />
</Plot>
