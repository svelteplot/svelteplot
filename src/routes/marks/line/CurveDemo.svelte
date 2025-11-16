<script lang="ts">
    import { Plot, LineY, Dot } from '$lib/index.js';
    import Slider from '$lib/ui/Slider.svelte';
    import Select from '$lib/ui/Select.svelte';
    import type { CurveName } from 'svelteplot/types/index.js';

    // curve demo
    const numbers = [
        0.25, 0.09, 0.58, 0.22, 0.38, 0.03, 0.45, 0.12, 0.87, 0.99, 0.85, 0.5, 0.64, 0.86, 0.6,
        0.09, 0.14, 0.95, 0.92, 0.89
    ];
    let curve: CurveName = $state('catmull-rom');
    let tension: number = $state(0.5);
    const CURVES =
        'basis,basis-open,basis-closed,bump-x,bump-y,bundle,cardinal,cardinal-open,cardinal-closed,catmull-rom,catmull-rom-open,catmull-rom-closed,linear,linear-closed,monotone-x,monotone-y,natural,step,step-after,step-before'.split(
            ','
        );
</script>

<Select label="curve" bind:value={curve} options={CURVES} />

{#if curve.includes('bundle') || curve.includes('catmull') || curve.includes('cardinal')}
    <Slider label="tension" bind:value={tension} min={0} max={2} step={0.1} />
{/if}

<Plot grid testid="curvedemo" height={300}>
    <LineY data={numbers} {curve} {tension} />
    <!-- TODO: use DotY here -->
    <Dot data={numbers.map((d, i) => ({ value: d, index: i }))} symbol="plus" y="value" x="index" />
</Plot>
