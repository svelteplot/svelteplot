<script lang="ts">
    import { Plot } from '$lib/index.js';
    import UsePlotChild from './usePlotChild.test.svelte';

    let { width = 100, height = 100 }: { width?: number; height?: number } = $props();
</script>

<Plot {width} {height}>
    <UsePlotChild />
</Plot>
