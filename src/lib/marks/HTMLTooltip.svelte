<!--
    @component
    For showing custom HTML tooltips positioned at x/y coordinates
-->
<script lang="ts" generics="Datum = DataRow">
    interface HTMLTooltipMarkProps {
        /** the input data array */
        data: Datum[];
        /** the horizontal position channel; bound to the x scale */
        x?: ChannelAccessor<Datum>;
        /** the vertical position channel; bound to the y scale */
        y?: ChannelAccessor<Datum>;
        /** the radius channel, used for positioning with dot-based data */
        r?: ChannelAccessor<Datum>;
        /** the horizontal facet channel */
        fx?: ChannelAccessor<Datum>;
        /** the vertical facet channel */
        fy?: ChannelAccessor<Datum>;
        /** snippet for rendering the tooltip content; receives the nearest datum */
        children: Snippet<[{ datum: Datum }]>;
    }
    import { type Snippet } from 'svelte';
    import type { ChannelAccessor, DataRow } from '../types/index.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    import { resolveChannel } from '../helpers/resolve.js';
    import { quadtree } from 'd3-quadtree';
    import { projectX, projectY } from '../helpers/scales.js';
    import { groupFacetsAndZ } from 'svelteplot/helpers/group.js';

    const plot = usePlot();

    let { data, x, y, r, fx, fy, children }: HTMLTooltipMarkProps = $props();

    let datum = $state<Datum | false>(false);
    let tooltipX = $state();
    let tooltipY = $state();

    let facetOffsetX = $state(0);
    let facetOffsetY = $state(0);

    function onPointerMove(evt: MouseEvent) {
        const plotRect = plot.body.getBoundingClientRect();
        let facetEl: Element | null = evt.target as Element;
        while (facetEl && !facetEl.classList.contains('facet')) {
            facetEl = facetEl.parentElement as Element | null;
        }
        const facetIndex = +((facetEl as HTMLElement)?.dataset?.facet ?? 0);
        const facetRect = ((facetEl?.firstChild as Element) ?? plot.body).getBoundingClientRect();

        facetOffsetX = facetRect.left - plotRect.left - plot.options.marginLeft;
        facetOffsetY = facetRect.top - plotRect.top - plot.options.marginTop;

        const relativeX = evt.clientX - facetRect.left + (plot.options.marginLeft ?? 0);
        const relativeY = evt.clientY - facetRect.top + (plot.options.marginTop ?? 0);

        const pt = trees[facetIndex].find(relativeX, relativeY, 25);
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

    const groups = $derived.by(() => {
        const groups: Datum[][] = [];
        groupFacetsAndZ(data, { fx, fy }, (d) => groups.push(d));
        return groups;
    });

    const trees = $derived(
        groups.map((items) =>
            quadtree<Datum>()
                .x((d) => projectX('x', plot.scales, resolveChannel('x', d, { x, y, r })))
                .y((d) => projectY('y', plot.scales, resolveChannel('y', d, { x, y, r })))
                .addAll(items)
        )
    );
</script>

<div
    class={['svelteplot-tooltip', { hide: !datum }]}
    style:left="{tooltipX ? facetOffsetX + projectX('x', plot.scales, tooltipX) : 0}px"
    style:top="{tooltipY ? facetOffsetY + projectY('y', plot.scales, tooltipY) : 0}px">
    {@render children({ datum: datum as Datum })}
</div>

<style>
    div.svelteplot-tooltip {
        position: absolute;
        pointer-events: none;

        &.hide {
            display: none;
        }
    }
</style>
