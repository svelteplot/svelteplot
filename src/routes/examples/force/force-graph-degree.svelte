<script module>
    export const title = 'Force graph with degree sizing';
    export const description = `Node radius encodes connection degree — characters with more co-occurrences appear larger, revealing the story's hubs.`;
    export const data = { graph: '/data/miserables.json' };
    export const fullCode = true;
    export const sortKey = 9;
    export const transforms = ['force'];
</script>

<script lang="ts">
    import { Plot, Arrow, Dot } from 'svelteplot';
    import { forceLayout } from 'svelteplot/transforms';
    let {
        graph
    }: { graph: { nodes: any[]; links: any[] } } = $props();

    const layout = $derived.by(() => {
        const degree = new Map<string, number>();
        for (const l of graph.links) {
            degree.set(
                l.source,
                (degree.get(l.source) ?? 0) + 1
            );
            degree.set(
                l.target,
                (degree.get(l.target) ?? 0) + 1
            );
        }
        const nodesWithDegree = graph.nodes.map(
            (n: any) => ({
                ...n,
                degree: degree.get(n.id) ?? 0
            })
        );
        return forceLayout(nodesWithDegree, graph.links);
    });
    const nodes = $derived(layout.nodes);
    const links = $derived(layout.links);
</script>

<Plot
    x={{ axis: false }}
    y={{ axis: false }}
    color={{ type: 'categorical' }}
    r={{ range: [2, 15] }}
    inset={10}
    height={550}>
    <Arrow
        data={links}
        x1={(d: any) => d.source.x}
        y1={(d: any) => d.source.y}
        x2={(d: any) => d.target.x}
        y2={(d: any) => d.target.y}
        strokeOpacity={0.3} />
    <Dot data={nodes} x="x" y="y" fill="group" r="degree" />
</Plot>
