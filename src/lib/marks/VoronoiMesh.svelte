<!-- @component
    Renders the full Voronoi diagram as a single SVG path.
-->
<script lang="ts" generics="Datum = DataRecord">
    interface VoronoiMeshMarkProps extends BaseMarkProps<Datum> {
        /** the input data array */
        data?: Datum[];
        /** the horizontal position channel */
        x?: ChannelAccessor<Datum>;
        /** the vertical position channel */
        y?: ChannelAccessor<Datum>;
        /** the grouping channel; separate diagrams per group */
        z?: ChannelAccessor<Datum>;
    }

    import { Delaunay } from 'd3-delaunay';
    import type {
        DataRecord,
        BaseMarkProps,
        ChannelAccessor,
        MarkType,
        ScaledDataRecord
    } from '../types/index.js';
    import { recordizeXY } from '../transforms/recordize.js';
    import Mark from '../Mark.svelte';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';

    const DEFAULTS = {
        ...getPlotDefaults().voronoiMesh
    };

    let markProps: VoronoiMeshMarkProps = $props();

    const {
        data = [] as Datum[],
        class: className = 'voronoi-mesh',
        ...options
    }: VoronoiMeshMarkProps = $derived({ ...DEFAULTS, ...markProps });

    const args = $derived(
        recordizeXY({
            data: data as any[],
            ...options
        })
    );

    const plot = usePlot();

    function computeMeshPath(scaledData: ScaledDataRecord<Datum>[]) {
        const x0 = plot.options.marginLeft;
        const y0 = plot.options.marginTop;
        const x1 = x0 + plot.facetWidth;
        const y1 = y0 + plot.facetHeight;

        // Guard against invalid bounds (zero-size or negative during initial render)
        if (!(x1 > x0) || !(y1 > y0)) return null;

        const valid = scaledData.filter(
            (d) => d.valid && typeof d.x === 'number' && typeof d.y === 'number'
        );
        if (valid.length < 2) return null;
        const delaunay = Delaunay.from(
            valid,
            (d) => d.x as number,
            (d) => d.y as number
        );
        const voronoi = delaunay.voronoi([x0, y0, x1, y1]);
        return voronoi.render();
    }
</script>

<Mark
    type={'voronoiMesh' as MarkType}
    channels={['x', 'y', 'z', 'fill', 'stroke', 'strokeOpacity', 'fillOpacity', 'opacity']}
    defaults={{ fill: 'none', stroke: 'currentColor' }}
    {...args}>
    {#snippet children({ scaledData })}
        {@const meshPath = computeMeshPath(scaledData)}
        <g class={className}>
            {#if meshPath}
                <path
                    d={meshPath}
                    fill="none"
                    stroke="currentColor"
                    stroke-opacity={options.strokeOpacity ?? 1}
                    stroke-width={options.strokeWidth ?? 1}
                />
            {/if}
        </g>
    {/snippet}
</Mark>
