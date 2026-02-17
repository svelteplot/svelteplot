<script lang="ts">
    import { Graticule, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';
    interface Props {
        plotArgs?: ComponentProps<typeof Plot>;
        graticuleArgs?: ComponentProps<typeof Graticule>;
    }
    let { plotArgs = {}, graticuleArgs = {} }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <Graticule {...graticuleArgs} />
</Plot>
