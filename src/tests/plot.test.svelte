<script lang="ts">
    import { Plot } from '$lib/index.js';
    import { setContext, type ComponentProps } from 'svelte';
    import type { PlotDefaults } from 'svelteplot/types';

    let {
        plotArgs,
        defaults = {}
    }: { plotArgs: ComponentProps<typeof Plot>; defaults?: Partial<PlotDefaults> } = $props();

    setContext('svelteplot/defaults', defaults);
</script>

<Plot {...plotArgs} />
