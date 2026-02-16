<script lang="ts">
    import { Vector, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';
    let args: ComponentProps<typeof Vector> = $props();
</script>

<Plot width={100} height={100} axes={false}>
    <Vector {...args} />
</Plot>
