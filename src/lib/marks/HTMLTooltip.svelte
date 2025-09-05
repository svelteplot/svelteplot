<!--
    @component
    For showing custom HTML tooltips positioned at x/y coordinates
-->
<script lang="ts" generics="Datum = DataRow">
    interface HTMLTooltipMarkProps {
        data: Datum[];
        x?: ChannelAccessor<Datum>;
        y?: ChannelAccessor<Datum>;
        r?: ChannelAccessor<Datum>;
        children: Snippet<[{ datum: Datum }]>;
    }
    import { getContext, type Snippet } from 'svelte';
    import type { ChannelAccessor, DataRow, PlotContext } from '../types/index.js';

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    let plot = $derived(getPlotState());

    import { resolveChannel } from '$lib/helpers/resolve.js';
    import { quadtree } from 'd3-quadtree';
    import { projectX, projectY } from '$lib/helpers/scales.js';

    let { data, x, y, r, children }: HTMLTooltipMarkProps = $props();

    let datum = $state(false);
    let tooltipX = $state();
    let tooltipY = $state();

    function onPointerMove(evt: MouseEvent) {
        const plotRect = plot.body.getBoundingClientRect();
        let relativeX = evt.clientX - plotRect.left;
        let relativeY = evt.clientY - plotRect.top;
        const pt = tree.find(relativeX, relativeY, 25);
        if (pt) {
            tooltipX = resolveChannel('x', pt, { x, y, r });
            tooltipY = resolveChannel('y', pt, { x, y, r });
            datum = pt;
        } else {
            datum = false;
        }
    }

    function onPointerLeave() {
        datum = false;
    }

    $effect(() => {
        plot.body?.addEventListener('pointerleave', onPointerLeave);
        plot.body?.addEventListener('pointermove', onPointerMove);

        return () => {
            plot.body?.removeEventListener('mouseleave', onPointerLeave);
            plot.body?.removeEventListener('pointermove', onPointerMove);
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
