<!-- @component
    Creates a vertical line chart with y values and index positions for x
-->
<script lang="ts">
    import Line, { type LineMarkProps } from './Line.svelte';
    import { recordizeY } from '$lib/index.js';

    let { data = [{}], ...rest }: Omit<LineMarkProps, 'x'> = $props();
    let args = $derived(recordizeY({ data, ...rest }));
</script>

<Line {...args} />
