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
    import { resolveProp, resolveStyles } from '../helpers/resolve.js';
    import { recordizeXY } from '../transforms/recordize.js';
    import { sort } from '../index.js';
    import Mark from '../Mark.svelte';
    import Anchor from './helpers/Anchor.svelte';
    import { addEventHandlers } from './helpers/events.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';

    const DEFAULTS = {
        ...getPlotDefaults().voronoi
    };

    let markProps: VoronoiMarkProps = $props();

    const {
        data = [] as Datum[],
        class: className = 'voronoi',
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

    function computeVoronoi(scaledData: ScaledDataRecord<Datum>[]) {
        const x0 = plot.options.marginLeft;
        const y0 = plot.options.marginTop;
        const x1 = x0 + plot.facetWidth;
        const y1 = y0 + plot.facetHeight;

        // Guard against invalid bounds (zero-size or negative during initial render)
        if (!(x1 > x0) || !(y1 > y0)) return null;

        // Build index map: validIndex → scaledData index
        const indexMap: number[] = [];
        const points: { x: number; y: number }[] = [];

        for (let i = 0; i < scaledData.length; i++) {
            const d = scaledData[i];
            if (d.valid && typeof d.x === 'number' && typeof d.y === 'number') {
                indexMap.push(i);
                points.push({ x: d.x, y: d.y });
            }
        }

        if (points.length < 2) return null;

        const delaunay = Delaunay.from(
            points,
            (d) => d.x,
            (d) => d.y
        );
        const voronoi = delaunay.voronoi([x0, y0, x1, y1]);

        // Build reverse map: scaledData index → voronoi cell index
        const reverseMap = new Map<number, number>();
        for (let vi = 0; vi < indexMap.length; vi++) {
            reverseMap.set(indexMap[vi], vi);
        }

        return { voronoi, reverseMap };
    }
</script>

<Mark
    type={'voronoi' as MarkType}
    channels={[
        'x',
        'y',
        'fill',
        'opacity',
        'stroke',
        'fillOpacity',
        'strokeOpacity'
    ]}
    defaults={{ fill: 'none', stroke: 'currentColor' }}
    {...args}>
    {#snippet children({ mark, usedScales, scaledData })}
        {@const result = computeVoronoi(scaledData)}
        <g class={className}>
            {#if result}
                {#each scaledData as d, i (i)}
                    {@const vi = result.reverseMap.get(i)}
                    {#if d.valid && vi != null}
                        {@const [style, styleClass] = resolveStyles(
                            plot,
                            d,
                            { strokeWidth: 1, ...args },
                            'stroke',
                            usedScales
                        )}
                        <Anchor options={options as any} datum={d.datum}>
                            <path
                                d={result.voronoi.renderCell(vi)}
                                class={styleClass}
                                {style}
                                {@attach addEventHandlers({
                                    plot,
                                    options: args as any,
                                    datum: d?.datum
                                })}
                            />
                        </Anchor>
                    {/if}
                {/each}
            {/if}
        </g>
    {/snippet}
</Mark>
