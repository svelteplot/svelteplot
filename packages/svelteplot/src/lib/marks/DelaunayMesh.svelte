<!-- @component
    Renders the full Delaunay triangulation as a single SVG path.
-->
<script lang="ts" generics="Datum = DataRecord">
    interface DelaunayMeshMarkProps extends BaseMarkProps<Datum> {
        /** the input data array */
        data?: Datum[];
        /** the horizontal position channel */
        x?: ChannelAccessor<Datum>;
        /** the vertical position channel */
        y?: ChannelAccessor<Datum>;
        /** the grouping channel; separate triangulations per group */
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
        ...getPlotDefaults().delaunayMesh
    };

    let markProps: DelaunayMeshMarkProps = $props();

    const {
        data = [] as Datum[],
        class: className = 'delaunay-mesh',
        canvas = false,
        ...options
    }: DelaunayMeshMarkProps = $derived({ ...DEFAULTS, ...markProps });

    const args = $derived(
        recordizeXY({
            data: data as any[],
            ...options
        })
    );

    const plot = usePlot();

    function computeMeshPaths(scaledData: ScaledDataRecord[]) {
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
                const path = delaunay.render();
                if (path) meshes.push({ path, datum: groupScaled[0] });
            },
            false
        );

        return meshes;
    }
</script>

<Mark
    type={'delaunayMesh' as MarkType}
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
