<script lang="ts">
    import { Spike, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';
    let args: ComponentProps<typeof Spike> = $props();
</script>

<Plot width={100} height={100} axes={false}>
    <Spike {...args} />
</Plot>
