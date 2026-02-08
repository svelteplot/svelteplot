<script lang="ts">
    import { symbol as d3Symbol } from 'd3-shape';
    import { maybeSymbol } from '../helpers/symbols.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    const plot = usePlot();

    // TODO: allow styling of legend
</script>

<!--
    @component
    The SymbolLegend is an HTML mark that can be placed in the header, footer and overlay
    snippets. You can activate an implicit SymbolLegend above the chart using the global
    symbol.legend scale option.
-->

{#if plot.scales.color.manualActiveMarks > 0}
    <div class="symbol-legend">
        {#each plot.scales.color.domain as value (value)}
            {@const symbolV = plot.scales.symbol.fn(value)}
            {@const symbolType = maybeSymbol(symbolV)}
            {@const color = plot.colorSymbolRedundant
                ? plot.scales.color.fn(value)
                : 'currentColor'}
            <div class="item">
                <div class="swatch">
                    <svg width="15" height="15">
                        <path
                            transform="translate(7.5,7.5)"
                            style:fill={plot.hasFilledDotMarks ? color : 'none'}
                            style:stroke={plot.hasFilledDotMarks ? null : color}
                            d={d3Symbol(symbolType, 40)()} />
                    </svg>
                </div>
                <span class="item-label">{value}</span>
            </div>
        {/each}
    </div>
{/if}

<style>
    .symbol-legend {
        text-align: left;
        font-size: 12px;
        display: inline-block;
        margin-right: 2em;
    }
    .item {
        margin: 0 1em 0.5ex 0;
    }
    path {
        stroke-width: 1.5;
    }
    .item,
    .item-label,
    .swatch {
        display: inline-block;
    }
    .item-label {
        vertical-align: text-bottom;
    }
</style>
