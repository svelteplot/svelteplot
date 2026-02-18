<script lang="ts">
    import { RegressionX, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';
    let args: ComponentProps<typeof RegressionX> = $props();
</script>

<Plot width={100} height={100} axes={false}>
    <RegressionX {...args} />
</Plot>
