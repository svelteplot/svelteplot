<script module>
    export const title = 'BoxY (sorted)';
    export const description =
        'BoxY plot of highway miles per gallon across vehicle classes, sorted by maximum value from largest to smallest.';
    export const data = { mpg: '/data/mpg.csv' };
    export const sortKey = 25;
</script>

<script lang="ts">
    import { Plot, BoxY } from 'svelteplot';
    let { mpg } = $props();
</script>

<Plot grid x={{ type: 'band' }} inset={10}>
    <BoxY
        data={mpg}
        x="class"
        y="hwy"
        sort="-max"
        fill="class"
        tickMinMax
        tickMedian={{
            stroke: 'var(--svelteplot-bg)',
            strokeWidth: 3
        }} />
</Plot>
