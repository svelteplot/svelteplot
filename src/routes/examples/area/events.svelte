<script module>
    export const title = 'Events';
</script>

<script lang="ts">
    import { Plot, AreaY } from 'svelteplot';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';
    const { riaa } = $derived(
        page.data.data
    ) as ExamplesData;

    let lastClicked = $state();
</script>

<Plot
    marginLeft={0}
    x={{ grid: true }}
    y={{ axis: false }}
    color={{ legend: true }}
    opacity={{ range: [0.4, 0.8] }}
    title={!lastClicked
        ? 'Hover an area'
        : 'You hovered ' + lastClicked.format}>
    <AreaY
        data={riaa}
        x="year"
        y="revenue"
        z="format"
        onpointerenter={(evt, d) => (lastClicked = d)}
        fill="group"
        opacity={lastClicked
            ? (d) =>
                  d.format === lastClicked.format ? 1 : 0
            : 0.8} />
</Plot>
