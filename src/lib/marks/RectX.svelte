<!-- @component
    Convenience wrapper for rectangles oriented along the x axis 
-->

<script lang="ts" generics="Datum extends DataRecord">
    interface RectXMarkProps extends Omit<ComponentProps<typeof Rect>, 'y'> {
        stack?: Partial<StackOptions>;
    }

    import Rect from './Rect.svelte';
    import { intervalY, stackX, recordizeX } from '$lib/index.js';
    import type { DataRecord, PlotContext } from '../types/index.js';
    import { getContext, type ComponentProps } from 'svelte';
    import type { StackOptions } from '$lib/transforms/stack.js';
    import { getPlotDefaults } from '$lib/hooks/plotDefaults.js';

    let markProps: RectXMarkProps = $props();

    const DEFAULTS = {
        ...getPlotDefaults().rect,
        ...getPlotDefaults().rectX
    };

    const {
        data = [{} as Datum],
        stack,
        ...options
    }: RectXMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    let plot = $derived(getPlotState());

    const args = $derived(stackX(intervalY(recordizeX({ data, ...options }), { plot }), stack));
</script>

<Rect {...args}></Rect>
