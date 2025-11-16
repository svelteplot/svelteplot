<script lang="ts">
    import { getContext } from 'svelte';
    import type { PlotContext, RawValue } from '$lib/index.js';

    let {
        id,
        stops
    }: {
        id: string;
        stops: { x: RawValue; color: string }[];
    } = $props();

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    const projectedStops = $derived(
        stops
            .map((d) => ({ ...d, px: plot.scales.x.fn(d.x) / plot.width }))
            .sort((a, b) => a.px - b.px)
    );
</script>

<linearGradient {id} gradientUnits="userSpaceOnUse" x1={0} y2={0} y1={0} x2={plot.width}>
    {#each projectedStops as { px, color }, i (i)}
        <stop stop-color={color} offset={px} />
    {/each}
</linearGradient>
