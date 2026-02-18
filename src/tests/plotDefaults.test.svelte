<script lang="ts">
    import { setPlotDefaults, getPlotDefaults } from 'svelteplot';
    import type { PlotDefaults } from 'svelteplot/types';

    let {
        defaults = {}
    }: {
        defaults?: Partial<PlotDefaults>;
    } = $props();

    setPlotDefaults(defaults);

    const result = getPlotDefaults();
</script>

<div data-testid="defaults" data-defaults={JSON.stringify(result)}></div>
