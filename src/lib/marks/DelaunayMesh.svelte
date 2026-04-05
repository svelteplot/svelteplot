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
    import { getPlotDefaults } from '../hooks/plotDefaults.js';

    const DEFAULTS = {
        ...getPlotDefaults().delaunayMesh
    };

    let markProps: DelaunayMeshMarkProps = $props();

    const {
        data = [] as Datum[],
        class: className = 'delaunay-mesh',
        ...options
    }: DelaunayMeshMarkProps = $derived({ ...DEFAULTS, ...markProps });

    const args = $derived(
        recordizeXY({
            data: data as any[],
            ...options
        })
    );

    function computeMeshPaths(scaledData: ScaledDataRecord<Datum>[]) {
        const valid = scaledData.filter(
            (d) => d.valid && typeof d.x === 'number' && typeof d.y === 'number'
        );
        if (valid.length < 2) return [];
        const delaunay = Delaunay.from(
            valid,
            (d) => d.x as number,
            (d) => d.y as number
        );
        return [delaunay.render()];
    }
</script>

<Mark
    type={'delaunayMesh' as MarkType}
    channels={['x', 'y', 'z', 'fill', 'stroke', 'strokeOpacity', 'fillOpacity', 'opacity']}
    defaults={{ fill: 'none', stroke: 'currentColor' }}
    {...args}>
    {#snippet children({ scaledData, usedScales })}
        {@const meshPaths = computeMeshPaths(scaledData)}
        <g class={className}>
            {#each meshPaths as d}
                <path
                    {d}
                    fill="none"
                    stroke="currentColor"
                    stroke-opacity={options.strokeOpacity ?? 1}
                    stroke-width={options.strokeWidth ?? 1}
                />
            {/each}
        </g>
    {/snippet}
</Mark>
