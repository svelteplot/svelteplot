<script lang="ts">
    import { usePlot } from '$lib/index.js';
    const plot = usePlot();
    // Extract fn to local to avoid Svelte proxy issues with d3 scale calls
    const fxFn = $derived(plot.scales.fx.fn);
    const fyFn = $derived(plot.scales.fy.fn);
    const fxPos = $derived(plot.scales.fx.domain.map((d) => fxFn(d)));
    const fyPos = $derived(plot.scales.fy.domain.map((d) => fyFn(d)));
</script>

<div
    data-testid="facet-scale-state"
    data-fx-range={JSON.stringify(plot.scales.fx.range)}
    data-fx-bandwidth={plot.scales.fx.fn.bandwidth?.() ?? 0}
    data-fx-positions={JSON.stringify(fxPos)}
    data-fy-range={JSON.stringify(plot.scales.fy.range)}
    data-fy-bandwidth={plot.scales.fy.fn.bandwidth?.() ?? 0}
    data-fy-positions={JSON.stringify(fyPos)}
    data-plot-width={plot.plotWidth}
    data-plot-height={plot.plotHeight}>
</div>
