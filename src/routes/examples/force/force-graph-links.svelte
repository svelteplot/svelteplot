<script module>
    export const title = 'Force graph with Link mark';
    export const description = `Using the <code>Link</code> mark instead of <code>Arrow</code> renders curved edges via the <code>bend</code> prop, giving the graph a softer appearance.`;
    export const data = { graph: '/data/miserables.json' };
    export const fullCode = true;
    export const sortKey = 4;
    export const transforms = ['force'];
</script>

<script lang="ts">
    import { Plot, Dot, Link } from 'svelteplot';
    import { forceLayout } from 'svelteplot/transforms';

    let {
        graph
    }: { graph: { nodes: any[]; links: any[] } } = $props();

    const layout = $derived(
        forceLayout(graph.nodes, graph.links)
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
    <Link
        data={links}
        x1={(d) => d.source.x}
        y1={(d) => d.source.y}
        x2={(d) => d.target.x}
        y2={(d) => d.target.y}
        bend={20}
        strokeOpacity={0.2}
        stroke="currentColor" />
    <Dot data={nodes} x="x" y="y" fill="group" />
</Plot>
