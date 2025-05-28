<!-- @component
    Convenience wrapper for rectangles oriented along the x axis 
-->
<script module lang="ts">
    export type RectYMarkProps = Omit<RectMarkProps, 'x'> & { stack?: Partial<StackOptions> };
</script>

<script lang="ts">
    import Rect, { type RectMarkProps } from './Rect.svelte';
    import { intervalX, stackY, recordizeY } from '$lib/index.js';
    import type { PlotContext } from '../types.js';
    import { getContext } from 'svelte';
    import type { StackOptions } from '$lib/transforms/stack';

    let { data = [{}], stack, ...options }: RectYMarkProps = $props();

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    const args = $derived(stackY(intervalX(recordizeY({ data, ...options }), { plot }), stack));
</script>

<Rect {...args}></Rect>
