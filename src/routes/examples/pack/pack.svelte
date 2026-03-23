<script module>
    export const title = 'Circle packing';
    export const description = `A circle-packing layout using the <code>packNode</code> transform. Circle size encodes the value of each node. Data: flare software package hierarchy.`;
    export const data = { flare: '/data/flare.csv' };
    export const fullCode = true;
    export const sortKey = 30;
    export const transforms = ['pack'];
</script>

<script lang="ts">
    import { Plot, Dot } from 'svelteplot';
    import { packNode } from 'svelteplot/transforms';

    let { flare }: { flare: any[] } = $props();

    const opts = {
        path: 'id',
        delimiter: '.',
        value: 'value',
        size: [500, 500] as [number, number],
        padding: 2
    };
    const nodes = $derived(packNode(opts)({ data: flare }));
</script>

<Plot
    x={{ axis: false }}
    y={{ axis: false }}
    aspectRatio={1}
    inset={2}
    height={500}>
    <Dot
        {...nodes}
        fill="depth"
        fillOpacity={0.6}
        stroke="depth" />
</Plot>
