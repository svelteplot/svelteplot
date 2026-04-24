<script lang="ts">
    import { Line, Plot } from 'svelteplot';
    import type { ComponentProps } from 'svelte';

    let args: ComponentProps<typeof Line> = $props();
</script>

<Plot width={100} height={100} axes={false}>
    <Line {...args} />
</Plot>
