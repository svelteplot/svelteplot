<!-- @component
    Renders vertical gridlines at x-axis tick positions
-->
<script module lang="ts">
    export type GridXMarkProps = Omit<BaseMarkProps, 'fill' | 'fillOpacity'> & {
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

    let { data = [], automatic = false, ...options }: GridXMarkProps = $props();

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    const autoTickCount = $derived(
        Math.max(3, Math.round(plot.facetWidth / plot.options.x.tickSpacing))
    );

    const ticks: RawValue[] = $derived(
        data.length > 0
            ? // use custom tick values if user passed any as prop
              data
            : // use custom scale tick values if user passed any as plot scale option
              autoTicks(
                  plot.scales.x.type,
                  plot.options.x.ticks,
                  plot.options.x.interval,
                  plot.scales.x.domain,
                  plot.scales.x.fn,
                  autoTickCount
              )
    );
</script>

<Mark
    type="gridX"
    data={data.length ? data.map((tick) => ({ [RAW_VALUE]: tick })) : []}
    channels={['y1', 'y2', 'x', 'stroke', 'strokeOpacity']}
    {...{ ...options, x: RAW_VALUE }}
    {automatic}>
    {#snippet children({ usedScales })}
        <g class="grid-x">
            {#each ticks as tick, t (t)}
                {#if testFilter(tick, options)}
                    {@const x =
                        plot.scales.x.fn(tick) +
                        (plot.scales.x.type === 'band' ? plot.scales.x.fn.bandwidth() * 0.5 : 0)}
                    {@const y1_ = resolveChannel('y1', tick, options)}
                    {@const y2_ = resolveChannel('y2', tick, options)}
                    {@const y1 = options.y1 != null ? plot.scales.y.fn(y1_) : 0}
                    {@const y2 = options.y2 != null ? plot.scales.y.fn(y2_) : plot.facetHeight}
                    {@const [style, styleClass] = resolveStyles(
                        plot,
                        { datum: { [RAW_VALUE]: tick } },
                        options,
                        'stroke',
                        usedScales,
                        true
                    )}
                    <line
                        class={styleClass}
                        transform="translate({x},{plot.options.marginTop})"
                        {style}
                        {y1}
                        {y2} />
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
