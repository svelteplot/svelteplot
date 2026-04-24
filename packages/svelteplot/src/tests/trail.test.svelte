<script lang="ts">
    import { Trail, Plot } from 'svelteplot';
    import type { ComponentProps } from 'svelte';

    let args: ComponentProps<typeof Trail> = $props();
</script>

<Plot width={120} height={120} axes={false}>
    <Trail {...args} />
</Plot>
