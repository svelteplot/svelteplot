<script module>
    export const title = 'Force graph with tooltip';
    export const description = `An HTML tooltip displays each character's name and group number on hover, positioned next to the node via the <code>HTMLTooltip</code> mark.`;
    export const data = { graph: '/data/miserables.json' };
    export const fullCode = true;
    export const sortKey = 5;
    export const transforms = ['force'];
</script>

<script lang="ts">
    import {
        Plot,
        Arrow,
        Dot,
        HTMLTooltip
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
    {#snippet overlay()}
        <HTMLTooltip data={nodes} x="x" y="y">
            {#snippet children({ datum })}
                <strong>{datum.id}</strong><br />
                Group {datum.group}
            {/snippet}
        </HTMLTooltip>
    {/snippet}
</Plot>
