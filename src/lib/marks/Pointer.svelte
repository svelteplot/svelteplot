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

    function onMouseMove(evt: MouseEvent) {
        const plotRect = plot.body.getBoundingClientRect();
        let relativeX = evt.clientX - plotRect.left;
        let relativeY = evt.clientY - plotRect.top;
        updateSelection(relativeX, relativeY);
    }

    function onTouchMove(evt: TouchEvent) {
        if (evt.touches) {
            const rect = (evt.target as HTMLElement).getBoundingClientRect();
            const pageTop = window.scrollY || document.documentElement.scrollTop;
            const ox = rect.left;
            const oy = rect.top + pageTop;

            const touch = evt.touches[0] || evt.changedTouches[0];
            if (touch) {
                const ex = touch.pageX - ox;
                const ey = touch.pageY - oy;
                updateSelection(ex, ey);
            }
        }
    }

    function onMouseLeave() {
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
        plot.body?.addEventListener('mousemove', onMouseMove);
        plot.body?.addEventListener('mouseleave', onMouseLeave);
        plot.body?.addEventListener('touchmove', onTouchMove);

        return () => {
            plot.body?.removeEventListener('mousemove', onMouseMove);
            plot.body?.removeEventListener('mouseleave', onMouseLeave);
            plot.body?.removeEventListener('touchmove', onTouchMove);
        };
    });

    const groups = $derived(
        z != null ? d3Groups(data, (d) => resolveChannel('z', d, { x, z })) : [[null, data]]
    );

    const trees = $derived(
        groups.map(([, items]) =>
            quadtree()
                .x(x != null ? (d) => d.__pointerX : () => 0)
                .y(y != null ? (d) => d.__pointerY : () => 0)
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
                            __pointerX: px,
                            __pointerY: py
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
