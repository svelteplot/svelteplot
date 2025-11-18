<script module>
    export const title = 'Streamgraph';
    export const transforms = ['stack'];
    export const description =
        'A streamgraph showing RIAA music industry revenue by format over time. Based on an example from <a href="https://observablehq.com/@observablehq/plot-stack-offset">Observable Plot</a>.';
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
