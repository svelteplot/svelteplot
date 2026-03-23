<script module>
    export const title = 'Tree with id/parentId';
    export const description = `Tree layout using <code>id</code>/<code>parentId</code> stratification instead of path-based. Useful when data is already in parent-child format.`;
    export const data = { flare: '/data/flare.csv' };
    export const fullCode = true;
    export const sortKey = 13;
    export const transforms = ['tree'];
</script>

<script lang="ts">
    import { Plot, Dot, Link, Text } from 'svelteplot';
    import { treeNode, treeLink } from 'svelteplot/transforms';

    let { flare }: { flare: any[] } = $props();

    // Convert dot-delimited paths to id/parentId format
    const hierarchyData = flare.map((d: any) => {
        const parts = d.id.split('.');
        return {
            id: d.id,
            parentId: parts.length > 1 ? parts.slice(0, -1).join('.') : null,
            name: parts[parts.length - 1],
            value: d.value
        };
    });

    const opts = { id: 'id', parentId: 'parentId' };
    const nodeData = treeNode(opts)({ data: hierarchyData }).data;
    const linkData = treeLink(opts)({ data: hierarchyData }).data;
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
        x1="x1" y1="y1" x2="x2" y2="y2"
        curve="bump-x"
        stroke="currentColor"
        strokeOpacity={0.5} />
    <Dot data={nodeData} x="x" y="y" fill="depth" r={3} />
    <Text
        data={nodeData}
        x="x" y="y"
        text={(d: any) => d.height === 0 ? d.name : null}
        dx={6}
        fontSize={9} />
</Plot>
