<script module>
    export const title = 'Partition (icicle)';
    export const description = `An icicle diagram using the <code>partitionNode</code> transform. Each depth level occupies a horizontal band, with width proportional to value. Data: flare software package hierarchy.`;
    export const data = { flare: '/data/flare.csv' };
    export const fullCode = true;
    export const sortKey = 40;
    export const transforms = ['partition'];
</script>

<script lang="ts">
    import { Plot, Rect } from 'svelteplot';
    import { partitionNode } from 'svelteplot/transforms';

    let { flare }: { flare: any[] } = $props();

    const opts = { path: 'id', delimiter: '.', value: 'value', size: [1, 1], padding: 1 };
    const nodes = partitionNode(opts)({ data: flare });
</script>

<Plot
    x={{ axis: false }}
    y={{ axis: false }}
    inset={2}
    height={500}>
    <Rect {...nodes} fill="depth" strokeWidth={0.5} stroke="white" />
</Plot>
