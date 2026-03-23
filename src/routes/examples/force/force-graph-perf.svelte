<script module>
    export const title = 'Force graph performance tuning';
    export const description = `For graphs with 500+ nodes, use <code>charge.distanceMax</code> to limit charge calculations, <code>alphaDecay</code> to converge faster, and fewer <code>ticks</code> as a hard cap.`;
    export const data = { graph: '/data/miserables.json' };
    export const fullCode = true;
    export const sortKey = 6;
    export const transforms = ['force'];
</script>

<script lang="ts">
    import { Plot, Arrow, Dot } from 'svelteplot';
    import { forceLayout } from 'svelteplot/transforms';

    let {
        graph
    }: { graph: { nodes: any[]; links: any[] } } = $props();

    const layout = $derived(
        forceLayout(graph.nodes, graph.links, {
            charge: { strength: -100, distanceMax: 200 },
            alphaDecay: 0.05,
            ticks: 150
        })
    );
    const nodes = $derived(layout.nodes);
    const links = $derived(layout.links);
</script>

<Plot
    x={{ axis: false }}
    y={{ axis: false }}
    color={{ type: 'categorical' }}
    inset={10}
    height={550}>
    <Arrow
        data={links}
        x1={(d) => d.source.x}
        y1={(d) => d.source.y}
        x2={(d) => d.target.x}
        y2={(d) => d.target.y}
        strokeOpacity={0.3} />
    <Dot data={nodes} x="x" y="y" fill="group" />
</Plot>
