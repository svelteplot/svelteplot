<!-- @component
    Convenience wrapper for rectangles oriented along the x axis 
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface RectYMarkProps extends Omit<ComponentProps<typeof Rect>, 'y'> {
        /** options for stacking rect data values */
        stack?: Partial<StackOptions>;
    }
    import Rect from './Rect.svelte';
    import { intervalX, stackY, recordizeY } from '../index.js';
    import type { DataRecord } from '../types/index.js';
    import { type ComponentProps } from 'svelte';
    import type { StackOptions } from '../transforms/stack.js';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    let markProps: RectYMarkProps = $props();

    const DEFAULTS = {
        ...getPlotDefaults().rect,
        ...getPlotDefaults().rectY
    };

    const {
        data = [{} as Datum],
        stack,
        ...options
    }: RectYMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    const plot = usePlot();

    const args = $derived(stackY(intervalX(recordizeY({ data, ...options })), stack));
</script>

<Rect {...args}></Rect>
