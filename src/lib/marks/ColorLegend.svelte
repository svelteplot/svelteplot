<script module lang="ts">
    export type ColorLegendMarkProps = {
        class: string | null;
    };
</script>

<script lang="ts">
    import { getContext } from 'svelte';
    import { Plot, AxisX, Frame } from '$lib/index.js';
    import { symbol as d3Symbol } from 'd3-shape';
    import { range as d3Range, extent } from 'd3-array';
    import { maybeSymbol } from '$lib/helpers/symbols.js';

    import type { DefaultOptions, PlotContext } from '../types.js';

    let { class: className = null }: ColorLegendMarkProps = $props();

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    const DEFAULTS = getContext<Partial<DefaultOptions>>('svelteplot/_defaults');

    const legendTitle = $derived(plot.options.color.label);
    const scaleType = $derived(plot.scales.color.type);
    const tickFormat = $derived(
        typeof plot.options.color?.tickFormat === 'function'
            ? plot.options.color.tickFormat
            : Intl.NumberFormat(
                  plot.options.locale,
                  plot.options.color.tickFormat || DEFAULTS.numberFormat
              ).format
    );
    const randId = Math.round(Math.random() * 1e6).toFixed(32);
</script>

<!--
    @component
    The ColorLegend is an HTML mark that can be placed in the header, footer and overlay
    snippets. You can activate an implicit ColorLegend above the chart using the global
    color.legend scale option.
-->

{#if plot.scales.color.manualActiveMarks > 0}
    <div class="color-legend {className || ''}">
        {#if legendTitle}
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            <div class="title">{@html legendTitle}</div>
        {/if}
        {#if scaleType === 'ordinal' || scaleType === 'categorical'}
            {#each plot.scales.color.domain as value (value)}
                {@const symbolV = plot.scales.symbol.fn(value)}
                {@const symbolType = maybeSymbol(symbolV)}
                <div class="item">
                    <div class="swatch">
                        <svg width="15" height="15"
                            >{#if plot.colorSymbolRedundant}
                                <path
                                    transform="translate(7.5,7.5)"
                                    style:fill={plot.hasFilledDotMarks
                                        ? plot.scales.color.fn(value)
                                        : 'none'}
                                    style:stroke={plot.hasFilledDotMarks
                                        ? null
                                        : plot.scales.color.fn(value)}
                                    d={d3Symbol(symbolType, 40)()} />
                            {:else}
                                <rect
                                    style:fill={plot.scales.color.fn(value)}
                                    width="15"
                                    height="15" />
                            {/if}</svg>
                    </div>
                    <span class="item-label">{value}</span>
                </div>
            {/each}
        {:else if scaleType === 'quantile' || scaleType === 'quantize' || scaleType === 'threshold'}
            {@const domain = extent(plot.scales.color.fn.domain())}
            {@const range = plot.scales.color.range}
            {@const tickLabels =
                scaleType === 'quantile'
                    ? plot.scales.color.fn.quantiles()
                    : scaleType === 'quantize'
                      ? plot.scales.color.fn.thresholds()
                      : plot.scales.color.fn.domain()}
            {@const ticks = d3Range(
                domain[0],
                domain[1],
                (domain[1] - domain[0]) / range.length
            ).slice(1)}
            <Plot
                maxWidth="240px"
                margins={1}
                marginLeft={1}
                marginRight={1}
                marginTop={6}
                marginBottom={20}
                height={38}
                inset={0}
                x={{ domain, ticks }}>
                <defs>
                    <linearGradient id="gradient-{randId}" x2="1">
                        <stop offset="0%" stop-color={range[0]} />
                        {#each ticks as t, i (i)}
                            {@const offset = (100 * (t - domain[0])) / (domain[1] - domain[0])}
                            <stop
                                offset="{offset - 0.001}%"
                                stop-color={plot.scales.color.fn(tickLabels[i] - 0.1)} />
                            <stop
                                offset="{offset}%"
                                stop-color={plot.scales.color.fn(tickLabels[i])} />
                        {/each}
                        <stop offset="100%" stop-color={range.at(-1)} />
                    </linearGradient>
                </defs>
                <Frame dy={-5} stroke={null} fill="url(#gradient-{randId})" />
                <AxisX tickSize={18} dy={-17} tickFormat={(d, i) => tickFormat(tickLabels[i])} />
            </Plot>
        {:else}
            <!--- continuous -->
            {@const domain = extent(plot.scales.color.domain)}
            {@const ticks = d3Range(domain[0], domain[1], (domain[1] - domain[0]) / 7).slice(1)}

            <Plot
                maxWidth="240px"
                margins={1}
                marginLeft={10}
                marginRight={10}
                marginTop={6}
                marginBottom={20}
                height={38}
                inset={0}
                x={{ domain, tickSpacing: 30, tickFormat }}>
                <defs>
                    <linearGradient id="gradient-{randId}" x2="1">
                        {#each ticks as t (t)}
                            <stop
                                offset="{(100 * (t - domain[0])) / (domain[1] - domain[0])}%"
                                stop-color={plot.scales.color.fn(t)} />
                        {/each}
                    </linearGradient>
                </defs>
                <Frame dy={-5} stroke={null} fill="url(#gradient-{randId})" />
                <AxisX tickSize={18} dy={-17} />
            </Plot>
        {/if}
    </div>
{/if}

<style>
    .color-legend {
        text-align: left;
        font-size: 12px;
        display: inline-block;
        margin-right: 2em;
    }
    .title {
        font-weight: 500;
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
        display: inline-flex;
        align-items: center;
    }
    .item-label {
        vertical-align: super;
    }
</style>
