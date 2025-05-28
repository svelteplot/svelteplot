<!-- 
    @component
    The FacetGrid component repeats the
    marks for each facet domain value 
-->
<script lang="ts">
    import { getContext, type Snippet } from 'svelte';
    import type { PlotContext, GenericMarkOptions, Mark } from '../types.js';
    import { scaleBand } from 'd3-scale';
    import Facet from './Facet.svelte';
    import { getEmptyFacets } from '../helpers/facets.js';

    const { getPlotState, updateDimensions } = getContext<PlotContext>('svelteplot');
    // we need the plot context for the overall width & height
    const plot = $derived(getPlotState());

    let {
        children,
        marks
    }: {
        children: Snippet;
        marks: Mark<GenericMarkOptions>[];
    } = $props();

    const useFacetX = $derived(plot.scales.fx.domain.length > 0);
    const useFacetY = $derived(plot.scales.fy.domain.length > 0);

    const fxValues = $derived(useFacetX ? plot.scales.fx.domain : [true]);
    const fyValues = $derived(useFacetY ? plot.scales.fy.domain : [true]);

    // we need to track which facets are "empty", meaning that they don't contain
    // any "faceted" data points. this can happen when fx and fy are combined and
    // certain combinations don't yield results
    const emptyFacets = $derived(getEmptyFacets(marks, fxValues, fyValues));

    // create band scales for fx and fy
    const facetXScale = $derived(
        scaleBand()
            .paddingInner(fxValues.length > 1 ? 0.1 : 0)
            .domain(fxValues)
            .rangeRound([0, plot.plotWidth])
    );
    const facetYScale = $derived(
        scaleBand()
            .paddingInner(fyValues.length > 1 ? 0.1 : 0)
            .domain(fyValues)
            .rangeRound([0, plot.plotHeight])
    );

    const facetWidth = $derived(useFacetX ? facetXScale.bandwidth() : plot.plotWidth);
    const facetHeight = $derived(useFacetY ? facetYScale.bandwidth() : plot.plotHeight);

    $effect.pre(() => {
        updateDimensions(facetWidth, facetHeight);
    });
</script>

{#each fxValues as facetX, i (i)}
    {#each fyValues as facetY, j (j)}
        <g
            class="facet"
            fill="currentColor"
            style:display={emptyFacets.get(facetX)?.get(facetY) ? 'none' : 'block'}
            transform="translate({useFacetX ? facetXScale(facetX) : 0}, {useFacetY
                ? facetYScale(facetY)
                : 0})">
            <Facet
                fx={facetX}
                fy={facetY}
                left={i === 0}
                right={i === fxValues.length - 1}
                top={j === 0}
                bottom={j === fyValues.length - 1}
                leftEmpty={!!(i === 0 || emptyFacets.get(fxValues[i - 1])?.get(facetY))}
                topEmpty={!!(j === 0 || emptyFacets.get(facetX)?.get(fyValues[j - 1]))}
                rightEmpty={!!(
                    i === fxValues.length - 1 || emptyFacets.get(fxValues[i + 1])?.get(facetY)
                )}
                bottomEmpty={!!(
                    j === fyValues.length - 1 || emptyFacets.get(facetX)?.get(fyValues[j + 1])
                )}>
                {@render children()}
            </Facet>
        </g>
    {/each}
{/each}
