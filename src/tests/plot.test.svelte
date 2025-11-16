<script lang="ts">
    import { Plot, setPlotDefaults } from '$lib/index.js';
    import { type ComponentProps } from 'svelte';
    import type { PlotDefaults } from 'svelteplot/types';

    let {
        plotArgs,
        defaults = {}
    }: { plotArgs: ComponentProps<typeof Plot>; defaults?: Partial<PlotDefaults> } = $props();

    setPlotDefaults(defaults);
</script>

<Plot {...plotArgs} />
