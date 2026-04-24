<!-- @component
    Renders the convex hull of data points. Supports grouping by z/fill/stroke
    to draw separate hulls per group.
-->
<script lang="ts" generics="Datum = DataRecord">
    interface HullMarkProps extends BaseMarkProps<Datum> {
        /** the input data array */
        data?: Datum[];
        /** the horizontal position channel */
        x?: ChannelAccessor<Datum>;
        /** the vertical position channel */
        y?: ChannelAccessor<Datum>;
        /** the grouping channel; separate hulls per group */
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
        ...getPlotDefaults().hull
    };

    let markProps: HullMarkProps = $props();

    const {
        data = [] as Datum[],
        class: className = 'hull',
        canvas = false,
        ...options
    }: HullMarkProps = $derived({ ...DEFAULTS, ...markProps });

    const args = $derived(
        recordizeXY({
            data: data as any[],
            ...options
        })
    );

    const plot = usePlot();

    function computeHulls(scaledData: ScaledDataRecord[]) {
        const scaledByDatum = new Map(scaledData.map((d) => [d.datum, d]));
        const hulls: { path: string; datum: ScaledDataRecord }[] = [];

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
                const path = delaunay.renderHull();
                if (path) hulls.push({ path, datum: groupScaled[0] });
            }
        );

        return hulls;
    }
</script>

<Mark
    type={'hull' as MarkType}
    channels={['x', 'y', 'fill', 'opacity', 'stroke', 'fillOpacity', 'strokeOpacity']}
    defaults={{ fill: 'none', stroke: 'currentColor' }}
    {...args}>
    {#snippet children({ scaledData, usedScales })}
        <PathGroup
            paths={computeHulls(scaledData)}
            {args}
            {className}
            {usedScales}
            {plot}
            defaultStrokeWidth={1.5}
            {canvas} />
    {/snippet}
</Mark>
