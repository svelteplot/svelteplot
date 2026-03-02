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
    import { detectFacet, facetKey } from '../helpers/facets.js';
    import { SvelteMap } from 'svelte/reactivity';

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
        const { fxValue, fyValue, offsetX, offsetY } = detectFacet(evt, plot);
        const bodyRect = plot.body.getBoundingClientRect();

        const relativeX = evt.clientX - bodyRect.left - offsetX;
        const relativeY = evt.clientY - bodyRect.top - offsetY;

        const key = facetKey(fxValue, fyValue);
        updateSelection(relativeX, relativeY, key);
    }

    function onPointerLeave() {
        selectedData = [];
        if (onupdate) onupdate(selectedData);
    }

    function updateSelection(ex: number, ey: number, key: string) {
        const facetTrees = treeMap.get(key) ?? [];
        // find data row with minimum distance to cursor
        const points = facetTrees.map((tree) =>
            tree.find(x != null ? ex : 0, y != null ? ey : 0, maxDistance)
        );
        // also include other points that share the same x or y value
        const otherPoints = facetTrees.flatMap((tree, i) => {
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

    const treeMap = $derived.by(() => {
        const map = new SvelteMap<string, ReturnType<typeof quadtree<any>>[]>();
        groupFacetsAndZ(indexData(data as object[]) as any, { x, y, z, fx, fy }, (items) => {
            if (!items.length) return;
            // Recover fx/fy values from the first datum in the group
            const fxVal = fx ? resolveChannel('fx', items[0], { fx }) : true;
            const fyVal = fy ? resolveChannel('fy', items[0], { fy }) : true;
            const key = facetKey(fxVal, fyVal);
            const tree = quadtree<any>()
                .x(x != null ? (d: any) => d[POINTER_X] : () => 0)
                .y(y != null ? (d: any) => d[POINTER_Y] : () => 0)
                .addAll(
                    items.map((d: any) => {
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
                    })
                );
            const existing = map.get(key) ?? [];
            existing.push(tree);
            map.set(key, existing);
        });
        return map;
    });
</script>

{#if children}
    <g class="pointer">
        {@render children({ data: selectedData })}
    </g>
{/if}
