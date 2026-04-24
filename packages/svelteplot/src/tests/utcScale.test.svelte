<script lang="ts">
    import { AxisX, Plot } from 'svelteplot';
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
