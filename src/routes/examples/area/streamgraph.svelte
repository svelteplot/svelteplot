<script module>
    export const title = 'Streamgraph';
    export const transforms = ['stack'];
</script>

<script lang="ts">
    import { Plot, AreaY } from 'svelteplot';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';
    const { riaa } = $derived(
        page.data.data
    ) as ExamplesData;
</script>

<Plot
    marginLeft={0}
    x={{ grid: true }}
    y={{ axis: false }}
    color={{ legend: true }}>
    <AreaY
        data={riaa}
        x="year"
        y="revenue"
        z="format"
        curve="basis"
        fill="group"
        opacity={0.8}
        stack={{ offset: 'wiggle', order: 'inside-out' }} />
</Plot>
