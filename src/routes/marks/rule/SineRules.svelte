<script lang="ts">
    import { Plot, RuleX, RuleY } from '$lib/index.js';
    import AxisX from '$lib/marks/AxisX.svelte';
    import GridX from '$lib/marks/GridX.svelte';
    import GridY from '$lib/marks/GridY.svelte';
    import { range } from 'd3-array';

    const ticks = range(0, 3.01, 0.5).map((d) => d * Math.PI);
</script>

<Plot testid="sine">
    <AxisX {ticks} tickFormat={(d) => `${Number(d) / Math.PI}π`} />
    <GridX data={ticks} />
    <GridY data={[-1, -0.5, 0, 0.5, 1]} />

    <RuleX
        data={range(0, Math.PI * 3, 0.1)}
        y1={0}
        y2={(d) => Math.sin(Number(d))}
        stroke="teal"
        strokeOpacity={0.8}
        strokeWidth={4} />
    <RuleY data={[0]} />
</Plot>
