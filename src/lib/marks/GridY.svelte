<!-- @component
    Renders horizontal gridlines at y-axis tick positions
-->
<script module lang="ts">
    export type GridYMarkProps = Omit<BaseMarkProps, 'fill' | 'fillOpacity'> & {
        data?: RawValue[];
        automatic?: boolean;
    };
</script>

<script lang="ts">
    import { getContext } from 'svelte';
    import Mark from '../Mark.svelte';
    import type { PlotContext, BaseMarkProps, RawValue } from '../types.js';
    import { resolveChannel, resolveStyles } from '../helpers/resolve.js';
    import { autoTicks } from '$lib/helpers/autoTicks.js';
    import { testFilter } from '$lib/helpers/index.js';
    import { RAW_VALUE } from '$lib/transforms/recordize.js';

    let { data = [], automatic = false, ...options }: GridYMarkProps = $props();

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    const autoTickCount = $derived(
        Math.max(2, Math.round(plot.facetHeight / plot.options.y.tickSpacing))
    );

    const ticks: RawValue[] = $derived(
        data.length > 0
            ? // use custom tick values if user passed any as prop
              data
            : // use custom scale tick values if user passed any as plot scale option
              autoTicks(
                  plot.scales.y.type,
                  plot.options.y.ticks,
                  plot.options.y.interval,
                  plot.scales.y.domain,
                  plot.scales.y.fn,
                  autoTickCount
              )
    );
</script>

<Mark
    type="gridY"
    data={data.length ? data.map((tick) => ({ [RAW_VALUE]: tick })) : []}
    channels={['x1', 'x2', 'y', 'stroke', 'strokeOpacity']}
    {...{ ...options, y: RAW_VALUE }}
    {automatic}>
    {#snippet children({ usedScales })}
        <g class="grid-y">
            {#each ticks as tick, t (t)}
                {#if testFilter(tick, options)}
                    {@const y =
                        plot.scales.y.fn(tick) +
                        (plot.scales.y.type === 'band' ? plot.scales.y.fn.bandwidth() * 0.5 : 0)}
                    {@const x1_ = resolveChannel('x1', tick, options)}
                    {@const x2_ = resolveChannel('x2', tick, options)}
                    {@const x1 = options.x1 != null ? plot.scales.x.fn(x1_) : 0}
                    {@const x2 = options.x2 != null ? plot.scales.x.fn(x2_) : plot.facetWidth}
                    {@const [style, styleClass] = resolveStyles(
                        plot,
                        { datum: { [RAW_VALUE]: tick } },
                        options,
                        'stroke',
                        usedScales,
                        true
                    )}
                    <line
                        {style}
                        class={styleClass}
                        transform="translate({plot.options.marginLeft},{y})"
                        {x1}
                        {x2} />
                {/if}
            {/each}
        </g>
    {/snippet}
</Mark>

<style>
    line {
        stroke: currentColor;
        stroke-opacity: 0.2;
    }
</style>
