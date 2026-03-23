<script module>
    export const title = 'Force graph with edge weights';
    export const description = `Edge thickness visually encodes co-occurrence count between characters. The simulation uses uniform link distance — weight is a visual encoding, not a force parameter.`;
    export const data = { graph: '/data/miserables.json' };
    export const fullCode = true;
    export const sortKey = 8;
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
            link: { distance: 50 }
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
        x1={(d: any) => d.source.x}
        y1={(d: any) => d.source.y}
        x2={(d: any) => d.target.x}
        y2={(d: any) => d.target.y}
        strokeWidth={(d: any) => Math.sqrt(d.value)}
        strokeOpacity={0.4} />
    <Dot data={nodes} x="x" y="y" fill="group" />
</Plot>
