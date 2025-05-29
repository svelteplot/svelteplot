<script lang="ts">
    import { AxisY, Plot } from 'svelteplot';
    import type { ComponentProps } from 'svelte';

    let {
        plotArgs = {},
        axisArgs = {}
    }: { plotArgs?: ComponentProps<typeof Plot>; axisArgs?: ComponentProps<typeof AxisY> } =
        $props();
</script>

<Plot {...plotArgs}>
    <AxisY {...axisArgs} />
</Plot>
