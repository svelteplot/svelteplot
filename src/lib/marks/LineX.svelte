<!-- @component
    Creates a horizontal line chart with x values and index positions for y
-->
<script lang="ts">
    import Line, { type LineMarkProps } from './Line.svelte';
    import { recordizeX } from '$lib/index.js';

    let { data = [{}], ...rest }: Omit<LineMarkProps, 'y'> = $props();

    let args = $derived(recordizeX({ data, ...rest }));
</script>

<Line {...args} />
