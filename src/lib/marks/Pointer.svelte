<script lang="ts" generics="Datum extends DataRow">
    interface PointerMarkProps {
        data: Datum[];
        children: Snippet<[{ data: Datum[] }]>;
        x?: ChannelAccessor<Datum>;
        y?: ChannelAccessor<Datum>;
        z?: ChannelAccessor<Datum>;
        /**
         * maximum cursor distance to select data points
         */
        maxDistance?: number;
        /**
         * called whenever the selection changes
         * @param data
         */
        onupdate?: (data: Datum[]) => void;
    }

    import { getContext, type Snippet } from 'svelte';
    import type { ChannelAccessor, DataRow, PlotContext, PlotDefaults } from '../types/index.js';
    import { groups as d3Groups } from 'd3-array';
    import { resolveChannel } from '$lib/helpers/resolve.js';
    import { quadtree } from 'd3-quadtree';
    import { projectXY } from '$lib/helpers/scales.js';
    import isDataRecord from '$lib/helpers/isDataRecord.js';
    import { RAW_VALUE } from 'svelteplot/transforms/recordize.js';

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    const POINTER_X = Symbol('pointerX');
    const POINTER_Y = Symbol('pointerY');

    let markProps: PointerMarkProps = $props();

    const DEFAULTS = {
        ...getContext<PlotDefaults>('svelteplot/_defaults').pointer
    };

    const {
        data = [{}],
        children,
        x,
        y,
        z,
        maxDistance = 15,
        onupdate = null
    }: PointerMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    let selectedData = $state([]);

    function onPointerMove(evt: MouseEvent) {
        let facetEl = evt.target as SVGElement;
        while (facetEl && !facetEl.classList.contains('facet')) {
            facetEl = facetEl.parentElement;
        }
        const facetRect = (facetEl?.firstChild ?? plot.body).getBoundingClientRect();

        const relativeX = evt.clientX - facetRect.left + (plot.options.marginLeft ?? 0);
        const relativeY = evt.clientY - facetRect.top + (plot.options.marginTop ?? 0);

        // console.log({ relativeX, relativeY }, evt);
        updateSelection(relativeX, relativeY);
    }

    function onPointerLeave() {
        selectedData = [];
        if (onupdate) onupdate(selectedData);
    }

    function updateSelection(ex: number, ey: number) {
        // find data row with minimum distance to
        const points = trees.map((tree) =>
            tree.find(x != null ? ex : 0, y != null ? ey : 0, maxDistance)
        );
        selectedData = points.filter((d) => d != null);
        if (onupdate) onupdate(selectedData);
    }

    $effect(() => {
        plot.body?.addEventListener('pointermove', onPointerMove);
        plot.body?.addEventListener('pointerleave', onPointerLeave);

        return () => {
            plot.body?.removeEventListener('pointermove', onPointerMove);
            plot.body?.removeEventListener('pointerleave', onPointerLeave);
        };
    });

    const groups = $derived(
        z != null ? d3Groups(data, (d) => resolveChannel('z', d, { x, z })) : [[null, data]]
    );

    const trees = $derived(
        groups.map(([, items]) =>
            quadtree()
                .x(x != null ? (d) => d[POINTER_X] : () => 0)
                .y(y != null ? (d) => d[POINTER_Y] : () => 0)
                .addAll(
                    items?.map((d) => {
                        const [px, py] = projectXY(
                            plot.scales,
                            resolveChannel('x', d, { x }),
                            resolveChannel('y', d, { y }),
                            true,
                            true
                        );
                        return {
                            ...(isDataRecord(d) ? d : { [RAW_VALUE]: d }),
                            [POINTER_X]: px,
                            [POINTER_Y]: py
                        };
                    }) ?? []
                )
        )
    );
</script>

{#if children}
    <g class="pointer">
        {@render children({ data: selectedData })}
    </g>
{/if}
