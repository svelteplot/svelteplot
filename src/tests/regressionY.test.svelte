<script lang="ts">
    import { RegressionY, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';
    let args: ComponentProps<typeof RegressionY> = $props();
</script>

<Plot width={100} height={100} axes={false}>
    <RegressionY {...args} />
</Plot>
