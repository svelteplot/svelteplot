<script lang="ts">
    import { BollingerX, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';
    let args: ComponentProps<typeof BollingerX> = $props();
</script>

<Plot width={100} height={100} axes={false}>
    <BollingerX {...args} />
</Plot>
