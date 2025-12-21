<!-- 
    @component
    The FacetAxes component renders the facet axes
-->
<script lang="ts">
    import { getContext } from 'svelte';
    import type { PlotContext } from '../types/index.js';
    import { scaleBand } from 'd3-scale';
    import BaseAxisX from '../marks/helpers/BaseAxisX.svelte';
    import BaseAxisY from '../marks/helpers/BaseAxisY.svelte';

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    // we need the plot context for the overall width & height
    const plot = $derived(getPlotState());

    const useFacetX = $derived(plot.scales.fx.domain.length > 0);
    const useFacetY = $derived(plot.scales.fy.domain.length > 0);

    const fxValues = $derived(useFacetX ? plot.scales.fx.domain : [true]);
    const fyValues = $derived(useFacetY ? plot.scales.fy.domain : [true]);

    // create band scales for fx and fy
    const facetXScale = $derived(
        scaleBand()
            .paddingInner(plot.options.fx?.paddingInner ?? plot.options.fx?.padding ?? 0.1)
            .domain(fxValues)
            .rangeRound([0, plot.plotWidth])
    );
    const facetYScale = $derived(
        scaleBand()
            .paddingInner(plot.options.fy?.paddingInner ?? plot.options.fy?.padding ?? 0.1)
            .domain(fyValues)
            .rangeRound([0, plot.plotHeight])
    );
</script>

<!-- facet grid -->
{#if fxValues.length > 1 && plot.options.fx.axis}
    <g transform="translate({plot.options.marginLeft}, 0)">
        <BaseAxisX
            class="facet-axis-x"
            scaleFn={facetXScale}
            scaleType="band"
            ticks={fxValues}
            tickFormat={plot.options.fx.tickFormat || ((d) => d)}
            tickFontSize={11}
            tickSize={0}
            tickPadding={plot.options.x.axis === plot.options.fx.axis ||
            plot.options.x.axis === 'both'
                ? 25
                : 5}
            anchor={plot.options.fx.axis}
            options={plot.options.fx.axisOptions || {}}
            {...plot.options.fx.axisProps || {}}
            height={plot.plotHeight}
            marginTop={plot.options.marginTop}
            {plot} />
    </g>
{/if}
{#if fyValues.length > 1 && plot.options.fy.axis}
    <g transform="translate(0, {plot.options.marginTop})">
        <BaseAxisY
            class="facet-axis-y"
            scaleFn={facetYScale}
            scaleType="band"
            ticks={fyValues}
            tickFormat={plot.options.fy.tickFormat || ((d) => d)}
            tickFontSize={11}
            tickSize={0}
            tickPadding={5}
            anchor={plot.options.fy.axis}
            lineAnchor="center"
            options={plot.options.fy.axisOptions || {}}
            {...plot.options.fy.axisProps || {}}
            width={plot.plotWidth}
            marginLeft={plot.options.marginLeft}
            {plot} />
    </g>
{/if}
