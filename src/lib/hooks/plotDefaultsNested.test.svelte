<script lang="ts">
    import { setPlotDefaults, getPlotDefaults } from './plotDefaults.js';
    import type { PlotDefaults } from 'svelteplot/types';

    let {
        parentDefaults = {},
        childDefaults = {}
    }: {
        parentDefaults?: Partial<PlotDefaults>;
        childDefaults?: Partial<PlotDefaults>;
    } = $props();

    setPlotDefaults(parentDefaults);
    setPlotDefaults(childDefaults);

    const result = getPlotDefaults();
</script>

<div data-testid="defaults" data-defaults={JSON.stringify(result)}></div>
