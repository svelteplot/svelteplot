<script module>
    export const title = 'Frame with ggplot style';
    export const description =
        'A frame with a light gray fill and white grid lines, similar to ggplot2 style.';
</script>

<script lang="ts">
    import {
        Plot,
        Frame,
        Line,
        GridX,
        GridY
    } from '$lib/index.js';
    import { page } from '$app/state';
    const { aapl } = $derived(page.data.data);
</script>

<Plot inset={10}>
    <Frame fill="currentColor" opacity={0.1} />
    <GridX
        stroke="var(--svelteplot-bg)"
        strokeOpacity={1} />
    <GridY
        stroke="var(--svelteplot-bg)"
        strokeOpacity={1} />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
