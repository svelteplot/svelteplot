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

    const plotHeight = 500;
    const inset = 2;
    // Pack layout uses [0,1] coordinates; scale r to match the
    // pixel dimensions of the plot area so circles size correctly.
    const pixelSize = plotHeight - 2 * inset;

    const opts = {
        path: 'id',
        delimiter: '.',
        value: 'value',
        size: [1, 1] as [number, number],
        padding: 0.005
    };
    const nodes = $derived(packNode(opts)({ data: flare }));
</script>

<Plot
    x={{ axis: false, domain: [0, 1] }}
    y={{ axis: false, domain: [0, 1] }}
    aspectRatio={1}
    inset={inset}
    height={plotHeight}>
    <Dot
        {...nodes}
        r={{ value: (d: any) => d.r * pixelSize, scale: null }}
        fill="depth"
        fillOpacity={0.6}
        stroke="depth" />
</Plot>
