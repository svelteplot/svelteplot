<script module>
    export const title = 'Step-curve tree';
    export const description = `A tree with step curves and horizontal layout, creating an org-chart or file-browser appearance.`;
    export const data = { flare: '/data/flare.csv' };
    export const fullCode = true;
    export const sortKey = 14;
    export const transforms = ['tree'];
</script>

<script lang="ts">
    import { Plot, Dot, Link, Text } from 'svelteplot';
    import { treeNode, treeLink } from 'svelteplot/transforms';

    let { flare }: { flare: any[] } = $props();

    const opts = { path: 'id', delimiter: '.', horizontal: true };
    const nodeData = treeNode(opts)({ data: flare }).data;
    const linkData = treeLink(opts)({ data: flare }).data;
</script>

<Plot
    x={{ axis: false }}
    y={{ axis: false }}
    inset={10}
    height={400}
    marginLeft={10}
    marginRight={140}>
    <Link
        data={linkData}
        x1="x1" y1="y1" x2="x2" y2="y2"
        curve="step-before"
        stroke="currentColor"
        strokeOpacity={0.5} />
    <Dot data={nodeData} x="x" y="y" fill="depth" r={3} />
    <Text
        data={nodeData}
        x="x" y="y"
        text={(d: any) => d.height === 0 ? d.id.split('.').pop() : null}
        dx={6}
        fontSize={9} />
</Plot>
