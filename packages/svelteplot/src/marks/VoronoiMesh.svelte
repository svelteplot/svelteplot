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
        /** Render using a canvas element instead of SVG paths. */
        canvas?: boolean;
    }

    import { Delaunay } from 'd3-delaunay';
    import type {
        DataRecord,
        BaseMarkProps,
        ChannelAccessor,
        MarkType,
        ScaledDataRecord
    } from '../types/index.js';
    import { groupFacetsAndZ } from '../helpers/group.js';
    import { recordizeXY } from '../transforms/recordize.js';
    import Mark from '../Mark.svelte';
    import PathGroup from './helpers/PathGroup.svelte';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';

    const DEFAULTS = {
        ...getPlotDefaults().voronoiMesh
    };

    let markProps: VoronoiMeshMarkProps = $props();

    const {
        data = [] as Datum[],
        class: className = 'voronoi-mesh',
        canvas = false,
        ...options
    }: VoronoiMeshMarkProps = $derived({ ...DEFAULTS, ...markProps });

    const args = $derived(
        recordizeXY({
            data: data as any[],
            ...options
        })
    );

    const plot = usePlot();

    function computeMeshPaths(scaledData: ScaledDataRecord[]) {
        const x0 = plot.options.marginLeft;
        const y0 = plot.options.marginTop;
        const x1 = x0 + plot.facetWidth;
        const y1 = y0 + plot.facetHeight;
        if (!(x1 > x0) || !(y1 > y0)) return [];

        const scaledByDatum = new Map(scaledData.map((d) => [d.datum, d]));
        const meshes: { path: string; datum: ScaledDataRecord }[] = [];

        groupFacetsAndZ(
            scaledData.map((d) => d.datum),
            args,
            (groupItems) => {
                const groupScaled = groupItems
                    .map((d) => scaledByDatum.get(d))
                    .filter(
                        (d): d is ScaledDataRecord =>
                            d !== undefined &&
                            d.valid &&
                            Number.isFinite(d.x as number) &&
                            Number.isFinite(d.y as number)
                    );
                if (groupScaled.length < 2) return;
                const delaunay = Delaunay.from(
                    groupScaled,
                    (d) => d.x as number,
                    (d) => d.y as number
                );
                const voronoi = delaunay.voronoi([x0, y0, x1, y1]);
                const path = voronoi.render();
                if (path) meshes.push({ path, datum: groupScaled[0] });
            },
            false
        );

        return meshes;
    }
</script>

<Mark
    type={'voronoiMesh' as MarkType}
    channels={['x', 'y', 'fill', 'stroke', 'strokeOpacity', 'fillOpacity', 'opacity']}
    defaults={{ fill: 'none', stroke: 'currentColor' }}
    {...args}>
    {#snippet children({ scaledData, usedScales })}
        <PathGroup
            paths={computeMeshPaths(scaledData)}
            {args}
            {className}
            {usedScales}
            {plot}
            {canvas} />
    {/snippet}
</Mark>
