<script lang="ts">
    import { getContext } from 'svelte';
    import type { PlotContext, RawValue } from '$lib/index.js';

    let {
        id,
        stops
    }: {
        id: string;
        stops: { y: RawValue; color: string }[];
    } = $props();

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    const projectedStops = $derived(
        stops
            .map((d) => ({ ...d, py: plot.scales.y.fn(d.y) / plot.height }))
            .sort((a, b) => a.py - b.py)
    );
</script>

<linearGradient {id} gradientUnits="userSpaceOnUse" x1={0} x2={0} y1={0} y2={plot.height}>
    {#each projectedStops as { py, color }, i (i)}
        <stop stop-color={color} offset={py} />
    {/each}
</linearGradient>
