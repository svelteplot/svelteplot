<script module>
    export const title = 'BoxY';
    export const data = { mpg: '/data/mpg.csv' };
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
        fill="class"
        tickMinMax
        tickMedian={{
            stroke: 'var(--svelteplot-bg)',
            strokeWidth: 3
        }} />
</Plot>
