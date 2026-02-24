<!-- @component
    Convenience wrapper for rectangles oriented along the x axis 
-->

<script lang="ts" generics="Datum extends DataRow">
    interface RectXMarkProps extends Omit<ComponentProps<typeof Rect>, 'y' | 'data'> {
        /** the input data array; each element becomes one rectangle */
        data?: Datum[];
        /** options for stacking rect data values */
        stack?: Partial<StackOptions>;
    }

    import Rect from './Rect.svelte';
    import { intervalY, stackX, recordizeX } from '../index.js';
    import type { DataRow } from '../types/index.js';
    import { type ComponentProps } from 'svelte';
    import type { StackOptions } from '../transforms/stack.js';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

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

    const plot = usePlot();

    const args = $derived(stackX(intervalY(recordizeX({ data, ...options })), stack));
</script>

<Rect {...args}></Rect>
