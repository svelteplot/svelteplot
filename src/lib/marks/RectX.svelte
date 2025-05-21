<script lang="ts">
    import Rect from './Rect.svelte';
    import { intervalY, stackX, recordizeX } from '$lib/index.js';
    import type {
        DataRow,
        BaseMarkProps,
        ChannelAccessor,
        BaseRectMarkProps,
        PlotContext
    } from '../types.js';
    import type { StackOptions } from '$lib/transforms/stack.js';
    import { getContext } from 'svelte';

    type RectXMarkProps = BaseMarkProps & {
        data: DataRow[];
        x?: ChannelAccessor;
        x1?: ChannelAccessor;
        x2?: ChannelAccessor;
        y1?: ChannelAccessor;
        y2?: ChannelAccessor;
        stack?: StackOptions;
        interval?: number | string;
    } & BaseRectMarkProps;

    let { data = [{}], stack, ...options }: RectXMarkProps = $props();

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    let plot = $derived(getPlotState());

    const args = $derived(stackX(intervalY(recordizeX({ data, ...options }), { plot }), stack));
</script>

<Rect {...args}></Rect>
