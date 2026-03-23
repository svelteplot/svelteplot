<script module>
    export const title = 'Force graph with hover';
    export const description = `Hover a node to highlight its direct connections. Unconnected nodes and edges fade out, making the local neighborhood structure visible.`;
    export const data = { graph: '/data/miserables.json' };
    export const fullCode = true;
    export const sortKey = 3;
    export const transforms = ['force'];
</script>

<script lang="ts">
    import {
        Plot,
        Arrow,
        Dot,
        Pointer,
        Text
    } from 'svelteplot';
    import { forceLayout } from 'svelteplot/transforms';
    let {
        graph
    }: { graph: { nodes: any[]; links: any[] } } = $props();

    const layout = $derived(
        forceLayout(graph.nodes, graph.links)
    );
    const nodes = $derived(layout.nodes);
    const links = $derived(layout.links);

    // Pre-compute adjacency set for O(1) hover lookups
    const neighbors = $derived.by(() => {
        const m = new Map<string, Set<string>>();
        for (const n of nodes) m.set(n.id, new Set());
        for (const l of links) {
            m.get(l.source.id)!.add(l.target.id);
            m.get(l.target.id)!.add(l.source.id);
        }
        return m;
    });

    let hoveredId = $state<string | null>(null);

    function isConnected(id: string): boolean {
        if (!hoveredId) return true;
        if (id === hoveredId) return true;
        return neighbors.get(hoveredId)?.has(id) ?? false;
    }

    function isEdgeActive(l: {
        source: { id: string };
        target: { id: string };
    }): boolean {
        if (!hoveredId) return true;
        return (
            l.source.id === hoveredId ||
            l.target.id === hoveredId
        );
    }
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
        strokeOpacity={(d) =>
            isEdgeActive(d) ? 0.3 : 0.05} />
    <Dot
        data={nodes}
        x="x"
        y="y"
        fill="group"
        fillOpacity={(d) =>
            isConnected(d.id) ? 0.9 : 0.15}
        onmouseenter={(_, d) => (hoveredId = d.id)}
        onmouseleave={() => (hoveredId = null)} />
    <Pointer data={nodes} x="x" y="y" maxDistance={50}>
        {#snippet children({ data: hovered })}
            <Text
                data={hovered}
                text="id"
                fill="currentColor"
                x="x"
                y="y"
                lineAnchor="bottom"
                dy={-8} />
        {/snippet}
    </Pointer>
</Plot>
