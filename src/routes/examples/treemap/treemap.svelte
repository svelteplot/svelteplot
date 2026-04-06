<script module>
    export const title = 'Treemap';
    export const description = `A space-filling treemap using the <code>treemapNode</code> transform. Rectangle size encodes the value of each leaf node. Data: flare software package hierarchy.`;
    export const data = { flare: '/data/flare.csv' };
    export const fullCode = true;
    export const sortKey = 20;
    export const transforms = ['treemap'];
</script>

<script lang="ts">
    import { Plot, Rect, Text } from 'svelteplot';
    import { treemapNode } from 'svelteplot/transforms';

    let { flare }: { flare: any[] } = $props();

    const opts = {
        path: 'id',
        delimiter: '.',
        value: 'value',
        size: [1, 1] as [number, number],
        padding: 0.01
    };
    const nodes = $derived(
        treemapNode(opts)({ data: flare })
    );
    const leaves = $derived({
        ...nodes,
        data: nodes.data.filter((d: any) => d.height === 0)
    });
</script>

<Plot
    x={{ axis: false }}
    y={{ axis: false }}
    inset={2}
    height={500}>
    <Rect
        {...leaves}
        fill="depth"
        strokeWidth={1}
        stroke="white" />
    <Text
        data={leaves.data.filter((d: any) => d.x1 - d.x0 > 0.05)}
        x={(d) => (d.x0 + d.x1) / 2}
        y={(d) => (d.y0 + d.y1) / 2}
        text={(d) => d.id.split('.').pop()}
        fontSize={8}
        textAnchor="middle" />
</Plot>
