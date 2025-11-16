<script module>
    export const title = 'Line grouping';
</script>

<script lang="ts">
    import { Plot, Line } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot color={{ scheme: 'rainbow' }}>
    <Line
        data={aapl}
        x="Date"
        y="Close"
        stroke={(d) => d.Date.getFullYear()} />
</Plot>
