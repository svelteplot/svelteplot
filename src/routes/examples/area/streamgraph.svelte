<script module>
    export const title = 'Streamgraph';
    export const transforms = ['stack'];
    export const data = { riaa: '/data/riaa.csv' };
    export const description =
        'A streamgraph showing RIAA music industry revenue by format over time. Based on an example from <a href="https://observablehq.com/@observablehq/plot-stack-offset">Observable Plot</a>.';
</script>

<script lang="ts">
    import { Plot, AreaY } from 'svelteplot';
    import type { RiaaRow } from '../types';
    const { riaa }: { riaa: RiaaRow[] } = $props();
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
