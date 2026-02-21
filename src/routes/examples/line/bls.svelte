<script module>
    export const title =
        'Multiple line chart with highlight';
    export const description =
        'Multiple unemployment lines by metro division with one series highlighted. Derived from an <a href="https://observablehq.com/@observablehq/plot-multiple-line-highlight">Observable Plot example</a>.';
    export const data = { bls: '/data/bls.csv' };
</script>

<script lang="ts">
    import { Plot, Line } from 'svelteplot';
    import type { BlsRow } from '../types';

    let { bls }: { bls: BlsRow[] } = $props();
</script>

<Plot grid>
    <Line
        data={bls}
        x="date"
        y="unemployment"
        z="division"
        outlineStroke="var(--svelteplot-bg)"
        sort={(d) => /, MI /.test(d.division)}
        stroke={(d) =>
            /, MI /.test(d.division)
                ? 'red'
                : '#99999955'} />
</Plot>
