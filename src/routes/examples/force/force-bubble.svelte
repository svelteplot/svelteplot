<script module>
    export const title = 'Bubble force layout';
    export const description = `A bubble layout using forceLayout with collision detection and no link force. Node size encodes connection degree.`;
    export const data = { graph: '/data/miserables.json' };
    export const fullCode = true;
    export const sortKey = 7;
    export const transforms = ['force'];
</script>

<script lang="ts">
    import { Plot, Dot } from 'svelteplot';
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
        return forceLayout(nodesWithDegree, graph.links, {
            link: false,
            collide: 8,
            charge: { strength: -30 },
            center: { strength: 0.05 }
        });
    });
    const nodes = $derived(layout.nodes);
</script>

<Plot
    x={{ axis: false }}
    y={{ axis: false }}
    color={{ type: 'categorical' }}
    inset={10}
    height={550}>
    <Dot
        data={nodes}
        x="x"
        y="y"
        fill="group"
        r={(d: any) => 3 + Math.sqrt(d.degree) * 2} />
</Plot>
