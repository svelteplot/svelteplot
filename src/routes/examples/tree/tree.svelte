<script module>
    export const title = 'Tree diagram';
    export const description = `A tree layout using the <code>treeNode</code> and <code>treeLink</code> transforms. The flare dataset represents a software package hierarchy.`;
    export const data = { flare: '/data/flare.csv' };
    export const fullCode = true;
    export const sortKey = 10;
    export const transforms = ['tree'];
</script>

<script lang="ts">
    import { Plot, Dot, Link, Text } from 'svelteplot';
    import {
        treeNode,
        treeLink
    } from 'svelteplot/transforms';

    let { flare }: { flare: any[] } = $props();

    const opts = { path: 'id', delimiter: '.' };
    const nodeData = $derived(
        treeNode(opts)({ data: flare }).data
    );
    const linkData = $derived(
        treeLink(opts)({ data: flare }).data
    );
</script>

<Plot
    x={{ axis: false }}
    y={{ axis: false }}
    inset={10}
    height={400}
    marginLeft={20}
    marginRight={120}>
    <Link
        data={linkData}
        x1="x1"
        y1="y1"
        x2="x2"
        y2="y2"
        curve="bump-x"
        stroke="currentColor"
        strokeOpacity={0.5} />
    <Dot data={nodeData} x="x" y="y" fill="depth" r={3} />
    <Text
        data={nodeData.filter((d: any) => d.height === 0)}
        x="x"
        y="y"
        text={(d: any) => d.id.split('.').pop()}
        dx={6}
        fontSize={9} />
</Plot>
