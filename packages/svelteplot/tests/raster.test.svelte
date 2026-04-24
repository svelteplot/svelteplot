<script lang="ts">
    import { Raster, Plot } from 'svelteplot';
    import type { ComponentProps } from 'svelte';

    let {
        plotArgs = {},
        rasterArgs
    }: { plotArgs?: ComponentProps<typeof Plot>; rasterArgs: ComponentProps<typeof Raster> } =
        $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <Raster {...rasterArgs} />
</Plot>
