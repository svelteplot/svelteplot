<!-- @component
    Renders individual Delaunay triangulation edges as separate paths,
    allowing per-edge styling based on the source data point.
-->
<script lang="ts" generics="Datum = DataRecord">
    interface DelaunayLinkMarkProps extends BaseMarkProps<Datum>, LinkableMarkProps<Datum> {
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
        LinkableMarkProps,
        MarkType,
        ScaledDataRecord
    } from '../types/index.js';
    import { resolveStyles } from '../helpers/resolve.js';
    import { recordizeXY } from '../transforms/recordize.js';
    import { sort } from '../index.js';
    import Mark from '../Mark.svelte';
    import Anchor from './helpers/Anchor.svelte';
    import { addEventHandlers } from './helpers/events.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';

    const DEFAULTS = {
        ...getPlotDefaults().delaunayLink
    };

    let markProps: DelaunayLinkMarkProps = $props();

    const {
        data = [] as Datum[],
        class: className = 'delaunay-link',
        ...options
    }: DelaunayLinkMarkProps = $derived({ ...DEFAULTS, ...markProps });

    const args = $derived(
        sort(
            recordizeXY({
                data: data as any[],
                ...options
            })
        )
    );

    const plot = usePlot();

    interface Edge {
        /** index into validData for source point */
        source: number;
        /** index into validData for target point */
        target: number;
        /** SVG path string for this edge */
        path: string;
    }

    function computeEdges(scaledData: ScaledDataRecord<Datum>[]) {
        // Collect valid points with index mapping
        const indexMap: number[] = [];
        const points: { x: number; y: number }[] = [];

        for (let i = 0; i < scaledData.length; i++) {
            const d = scaledData[i];
            if (d.valid && typeof d.x === 'number' && typeof d.y === 'number') {
                indexMap.push(i);
                points.push({ x: d.x, y: d.y });
            }
        }

        if (points.length < 2) return [];

        const delaunay = Delaunay.from(
            points,
            (d) => d.x,
            (d) => d.y
        );

        // Extract unique edges from triangulation
        const { halfedges, triangles } = delaunay;
        const edges: Edge[] = [];
        const seen = new Set<string>();

        for (let i = 0; i < halfedges.length; i++) {
            const j = halfedges[i];
            if (j < i && j !== -1) continue; // already processed from the other side
            const a = triangles[i];
            const b = triangles[i % 3 === 2 ? i - 2 : i + 1];
            const key = a < b ? `${a},${b}` : `${b},${a}`;
            if (seen.has(key)) continue;
            seen.add(key);

            const p = points[a];
            const q = points[b];
            edges.push({
                source: indexMap[a],
                target: indexMap[b],
                path: `M${p.x},${p.y}L${q.x},${q.y}`
            });
        }

        return edges;
    }
</script>

<Mark
    type={'delaunayLink' as MarkType}
    channels={[
        'x',
        'y',
        'z',
        'fill',
        'opacity',
        'stroke',
        'fillOpacity',
        'strokeOpacity'
    ]}
    defaults={{ fill: 'none', stroke: 'currentColor' }}
    {...args}>
    {#snippet children({ mark, usedScales, scaledData })}
        {@const edges = computeEdges(scaledData)}
        <g class={className}>
            {#each edges as edge (edge.path)}
                {@const d = scaledData[edge.source]}
                {@const [style, styleClass] = resolveStyles(
                    plot,
                    d,
                    { strokeWidth: 1, ...args },
                    'stroke',
                    usedScales
                )}
                <Anchor options={options as any} datum={d.datum}>
                    <path
                        d={edge.path}
                        class={styleClass}
                        {style}
                        {@attach addEventHandlers({
                            plot,
                            options: args as any,
                            datum: d?.datum
                        })}
                    />
                </Anchor>
            {/each}
        </g>
    {/snippet}
</Mark>
