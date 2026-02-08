<script lang="ts">
    import { Link, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';

    let args: ComponentProps<typeof Link> = $props();
</script>

<Plot width={100} height={100} axes={false}>
    <Link {...args} />
</Plot>
