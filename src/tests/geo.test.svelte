<script lang="ts">
    import { Geo, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';
    interface Props {
        plotArgs?: ComponentProps<typeof Plot>;
        geoArgs: ComponentProps<typeof Geo>;
    }
    let { plotArgs = {}, geoArgs }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <Geo {...geoArgs} />
</Plot>
