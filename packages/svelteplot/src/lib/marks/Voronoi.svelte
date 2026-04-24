<!-- @component
    Renders individual Voronoi cells, one per data point, allowing per-cell styling.
-->
<script lang="ts" generics="Datum = DataRecord">
    interface VoronoiMarkProps extends BaseMarkProps<Datum>, LinkableMarkProps<Datum> {
        /** the input data array */
        data?: Datum[];
        /** the horizontal position channel */
        x?: ChannelAccessor<Datum>;
        /** the vertical position channel */
        y?: ChannelAccessor<Datum>;
        /** the grouping channel; separate Voronoi diagrams per group */
        z?: ChannelAccessor<Datum>;
        /** Render using a canvas element instead of SVG paths. */
        canvas?: boolean;
    }

    import { Delaunay } from 'd3-delaunay';
    import type {
        DataRecord,
        BaseMarkProps,
        ChannelAccessor,
        LinkableMarkProps,
        MarkType,
        ScaledDataRecord
    } from '../types/index.js';
    import { groupFacetsAndZ } from '../helpers/group.js';
    import { recordizeXY } from '../transforms/recordize.js';
    import { sort } from '../index.js';
    import Mark from '../Mark.svelte';
    import PathItems from './helpers/PathItems.svelte';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';

    const DEFAULTS = {
        ...getPlotDefaults().voronoi
    };

    let markProps: VoronoiMarkProps = $props();

    const {
        data = [] as Datum[],
        class: className = 'voronoi',
        canvas = false,
        ...options
    }: VoronoiMarkProps = $derived({ ...DEFAULTS, ...markProps });

    const args = $derived(
        sort(
            recordizeXY({
                data: data as any[],
                ...options
            })
        )
    );

    const plot = usePlot();

    function computeVoronoi(scaledData: ScaledDataRecord[]) {
        const x0 = plot.options.marginLeft;
        const y0 = plot.options.marginTop;
        const x1 = x0 + plot.facetWidth;
        const y1 = y0 + plot.facetHeight;
        if (!(x1 > x0) || !(y1 > y0)) return [];

        const scaledByDatum = new Map(scaledData.map((d) => [d.datum, d]));
        const results: { path: string; datum: ScaledDataRecord }[] = [];

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

                groupScaled.forEach((d, cellIndex) => {
                    const path = voronoi.renderCell(cellIndex);
                    if (path) results.push({ path, datum: d });
                });
            },
            false
        );

        return results;
    }
</script>

<Mark
    type={'voronoi' as MarkType}
    channels={['x', 'y', 'fill', 'opacity', 'stroke', 'fillOpacity', 'strokeOpacity']}
    defaults={{ fill: 'none', stroke: 'currentColor' }}
    {...args}>
    {#snippet children({ mark, usedScales, scaledData })}
        <PathItems
            paths={computeVoronoi(scaledData)}
            {args}
            {options}
            {className}
            {usedScales}
            {plot}
            {canvas} />
    {/snippet}
</Mark>
