<script lang="ts">
    import Mark from '../Mark.svelte';
    import { getContext } from 'svelte';
    import type { PlotContext, BaseRectMarkProps } from '../types.js';
    import type { BaseMarkProps } from '../types.js';
    import { resolveProp, resolveScaledStyles } from '../helpers/resolve.js';
    import { addEventHandlers } from './helpers/events.js';

    type FrameMarkProps = BaseMarkProps &
        BaseRectMarkProps & {
            automatic?: boolean;
        };

    let { automatic, class: className = null, ...options }: FrameMarkProps = $props();

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    const dx = $derived(resolveProp(options.dx, null, 0));
    const dy = $derived(resolveProp(options.dy, null, 0));

    const {
        insetLeft = options.inset || 0,
        insetTop = options.inset || 0,
        insetRight = options.inset || 0,
        insetBottom = options.inset || 0
    } = $derived(options);
</script>

<Mark type="frame" {automatic}>
    <rect
        class={['frame', className]}
        transform={dx || dy ? `translate(${dx},${dy})` : null}
        style={resolveScaledStyles({}, options, {}, plot, 'stroke')}
        x={plot.options.marginLeft + +insetLeft}
        y={plot.options.marginTop + +insetTop}
        rx={resolveProp(options.rx, null, null)}
        ry={resolveProp(options.ry, null, null)}
        width={plot.facetWidth - (insetLeft || 0) - (insetRight || 0)}
        height={plot.facetHeight - (insetBottom || 0) - (insetTop || 0)}
        use:addEventHandlers={{ getPlotState, options: options, datum: {} }} />
</Mark>

<style>
</style>
