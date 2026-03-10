<script lang="ts">
    import { Raster, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';

    let args: ComponentProps<typeof Raster> = $props();
</script>

<Plot width={100} height={100} axes={false}>
    <Raster {...args} />
</Plot>
