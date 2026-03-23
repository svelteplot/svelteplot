<script module>
    export const title = 'Force-directed graph';
    export const description = `A network diagram using the <code>forceNode</code> and <code>forceLink</code> transforms to compute node and link positions. Data: character co-occurrence network from <em>Les Misérables</em>.`;
    export const data = { graph: '/data/miserables.json' };
    export const fullCode = true;
    export const sortKey = 2;
    export const transforms = ['force'];
</script>

<script lang="ts">
    import { Plot, Arrow, Dot } from 'svelteplot';
    import {
        forceNode,
        forceLink
    } from 'svelteplot/transforms';

    let {
        graph
    }: { graph: { nodes: any[]; links: any[] } } = $props();

    const nodeTransform = $derived(forceNode(graph.links));
    const linkTransform = $derived(forceLink(graph.nodes));
</script>

<Plot
    x={{ axis: false }}
    y={{ axis: false }}
    color={{ type: 'categorical' }}
    inset={10}
    height={550}>
    <Arrow
        {...linkTransform({ data: graph.links })}
        strokeOpacity={0.3} />
    <Dot
        {...nodeTransform({ data: graph.nodes })}
        fill="group" />
</Plot>
