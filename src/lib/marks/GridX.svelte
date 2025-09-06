<!-- @component
    Renders vertical gridlines at x-axis tick positions
-->
<script lang="ts" generics="Datum = RawValue">
    interface GridXMarkProps extends Omit<BaseMarkProps<Datum>, 'fill' | 'fillOpacity'> {
        data?: Datum[];
        automatic?: boolean;
    }
    import { getContext } from 'svelte';
    import Mark from '../Mark.svelte';
    import type { PlotContext, BaseMarkProps, RawValue, PlotDefaults } from '../types/index.js';
    import { resolveChannel, resolveProp, resolveStyles } from '../helpers/resolve.js';
    import { autoTicks } from '$lib/helpers/autoTicks.js';
    import { testFilter } from '$lib/helpers/index.js';
    import { RAW_VALUE } from '$lib/transforms/recordize.js';

    let markProps: GridXMarkProps = $props();

    const DEFAULTS = {
        ...getContext<PlotDefaults>('svelteplot/_defaults').grid,
        ...getContext<PlotDefaults>('svelteplot/_defaults').gridX
    };

    const {
        data = [],
        automatic = false,
        ...options
    }: GridXMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

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
                    {@const dx = +resolveProp(options?.dx, tick, 0)}
                    {@const dy = +resolveProp(options?.dy, tick, 0)}
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
                        transform="translate({x + dx},{plot.options.marginTop + dy})"
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
