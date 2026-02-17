<script lang="ts">
    import { usePlot } from 'svelteplot';

    const plot = usePlot();
</script>

<div
    data-testid="plot-state"
    data-width={plot.width}
    data-height={plot.height}
    data-plot-width={plot.plotWidth}
    data-plot-height={plot.plotHeight}>
</div>
