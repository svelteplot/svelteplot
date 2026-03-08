<script lang="ts">
    import { AxisX, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';

    let {
        plotArgs = {},
        axisArgs = {}
    }: { plotArgs?: ComponentProps<typeof Plot>; axisArgs?: ComponentProps<typeof AxisX> } =
        $props();
</script>

<Plot {...plotArgs}>
    <AxisX {...axisArgs} />
</Plot>
