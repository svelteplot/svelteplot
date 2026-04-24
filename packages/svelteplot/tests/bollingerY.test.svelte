<script lang="ts">
    import { BollingerY, Plot } from 'svelteplot';
    import type { ComponentProps } from 'svelte';
    let args: ComponentProps<typeof BollingerY> = $props();
</script>

<Plot width={100} height={100} axes={false}>
    <BollingerY {...args} />
</Plot>
