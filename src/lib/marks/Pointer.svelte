<script lang="ts" generics="Datum extends DataRow">
    interface PointerMarkProps {
        /** the input data array */
        data: Datum[];
        /** snippet rendered with the currently selected data points */
        children?: Snippet<[{ data: Datum[] }]>;
        /** the horizontal position channel; bound to the x scale */
        x?: ChannelAccessor<Datum>;
        /** the vertical position channel; bound to the y scale */
        y?: ChannelAccessor<Datum>;
        /** grouping channel for splitting data into separate search trees */
        z?: ChannelAccessor<Datum>;
        /** the horizontal facet channel */
        fx?: ChannelAccessor<Datum>;
        /** the vertical facet channel */
        fy?: ChannelAccessor<Datum>;
        /**
         * maximum cursor distance to select data points
         */
        maxDistance?: number;
        /**
         * tolerance for considering points as "the same" when sharing x or y values
         * defaults to 0 pixel
         */
        tolerance?: number;
        /**
         * called whenever the selection changes
         * @param data
         */
        onupdate?: (data: Datum[]) => void;
    }

    import { type Snippet } from 'svelte';
    import type { ChannelAccessor, DataRow } from '../types/index.js';
    import { resolveChannel } from '../helpers/resolve.js';
    import { quadtree } from 'd3-quadtree';
    import { projectXY } from '../helpers/scales.js';
    import isDataRecord from '../helpers/isDataRecord.js';
    import { indexData, RAW_VALUE } from 'svelteplot/transforms/recordize.js';
    import { groupFacetsAndZ } from 'svelteplot/helpers/group.js';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    const plot = usePlot();

    const POINTER_X = Symbol('pointerX');
    const POINTER_Y = Symbol('pointerY');

    let markProps: PointerMarkProps = $props();

    const DEFAULTS = {
        ...getPlotDefaults().pointer
    };

    const {
        data = [] as Datum[],
        children,
        x,
        y,
        z,
        fx,
        fy,
        maxDistance = 15,
        tolerance = Number.NEGATIVE_INFINITY,
        onupdate = undefined
    }: PointerMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    let selectedData = $state<any[]>([]);

    function onPointerMove(evt: MouseEvent) {
        let facetEl: Element | null = evt.target as Element;
        while (facetEl && !facetEl.classList.contains('facet')) {
            facetEl = facetEl.parentElement as Element | null;
        }
        const facetRect = ((facetEl?.firstChild as Element) ?? plot.body).getBoundingClientRect();

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
        // also include other points that share the same x or y value
        const otherPoints = trees.flatMap((tree, i) => {
            return tree
                .data()
                .filter((d) => d !== points[i])
                .filter(
                    (d: any) =>
                        (!isFinite(d[POINTER_X]) ||
                            Math.abs(d[POINTER_X] - (points[i] as any)?.[POINTER_X]) < tolerance) &&
                        (!isFinite(d[POINTER_Y]) ||
                            Math.abs(d[POINTER_Y] - (points[i] as any)?.[POINTER_Y]) < tolerance)
                );
        });
        selectedData = [...points, ...otherPoints].filter((d) => d != null);
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

    const groups = $derived.by(() => {
        const groups: any[][] = [];
        groupFacetsAndZ(indexData(data as object[]) as any, { x, y, z, fx, fy }, (d) => groups.push(d));
        return groups;
    });

    const trees = $derived(
        groups.map((items) =>
            quadtree<any>()
                .x(x != null ? (d: any) => d[POINTER_X] : () => 0)
                .y(y != null ? (d: any) => d[POINTER_Y] : () => 0)
                .addAll(
                    items?.map((d: any) => {
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
