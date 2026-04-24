<script lang="ts">
    import { RegressionY, Plot } from 'svelteplot';
    import type { ComponentProps } from 'svelte';
    let args: ComponentProps<typeof RegressionY> = $props();
</script>

<Plot width={200} height={100} axes={false}>
    <RegressionY {...args} />
</Plot>
