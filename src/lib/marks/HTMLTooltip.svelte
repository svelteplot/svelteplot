<!--
    @component
    For showing custom HTML tooltips positioned at x/y coordinates
-->
<script module lang="ts">
    import type { ChannelAccessor, DataRow } from '$lib/types.js';

    export type HTMLTooltipMarkProps = {
        data: DataRow[];
        x?: ChannelAccessor;
        y?: ChannelAccessor;
        r?: ChannelAccessor;
        children: Snippet<[{ datum: DataRow }]>;
    };
</script>

<script lang="ts">
    import { getContext, type Snippet } from 'svelte';
    import type { PlotContext } from '../types.js';

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    let plot = $derived(getPlotState());

    import { resolveChannel } from '$lib/helpers/resolve.js';
    import { quadtree } from 'd3-quadtree';
    import { projectX, projectY } from '$lib/helpers/scales.js';

    let { data, x, y, r, children }: HTMLTooltipMarkProps = $props();

    let datum = $state(false);
    let tooltipX = $state();
    let tooltipY = $state();

    function onMouseMove(evt: MouseEvent) {
        const pt = tree.find(evt.layerX, evt.layerY, 25);
        if (pt) {
            tooltipX = resolveChannel('x', pt, { x, y, r });
            tooltipY = resolveChannel('y', pt, { x, y, r });
            datum = pt;
        } else {
            datum = false;
        }
    }

    $effect(() => {
        // plot.body?.addEventListener('mouseenter', onMouseEnter);
        // plot.body?.addEventListener('mouseleave', onMouseLeave);
        plot.body?.addEventListener('mousemove', onMouseMove);

        return () => {
            // plot.body?.removeEventListener('mouseenter', onMouseEnter);
            // plot.body?.removeEventListener('mouseleave', onMouseLeave);
            plot.body?.removeEventListener('mousemove', onMouseMove);
        };
    });

    let tree = $derived(
        quadtree()
            .x((d) => projectX('x', plot.scales, resolveChannel('x', d, { x, y, r })))
            .y((d) => projectY('y', plot.scales, resolveChannel('y', d, { x, y, r })))
            .addAll(data)
    );
</script>

<div
    class={['tooltip', { hide: !datum }]}
    style:left="{tooltipX ? projectX('x', plot.scales, tooltipX) : 0}px"
    style:top="{tooltipY ? projectY('y', plot.scales, tooltipY) : 0}px">
    <div class="tooltip-body">
        {@render children({ datum })}
    </div>
</div>

<style>
    div.tooltip {
        background: white;
        background: var(--svelteplot-tooltip-bg);
        border: 1px solid #ccc;
        border-color: var(--svelteplot-tooltip-border);
        font-size: 13px;
        padding: 1ex 1em;
        border-radius: 3px;
        box-shadow:
            rgba(50, 50, 93, 0.25) 0px 2px 5px -1px,
            rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
        position: absolute;
        pointer-events: none;
    }
    .tooltip.hide {
        display: none;
    }
</style>
