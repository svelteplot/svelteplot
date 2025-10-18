<!-- @component
    Renders horizontal gridlines at y-axis tick positions
-->
<script lang="ts" generics="Datum = RawValue">
    interface GridYMarkProps extends Omit<BaseMarkProps<Datum>, 'fill' | 'fillOpacity'> {
        data?: Datum[];
        automatic?: boolean;
        x1?: ChannelAccessor<Datum>;
        x2?: ChannelAccessor<Datum>;
    }
    import { getContext } from 'svelte';
    import Mark from '../Mark.svelte';
    import type { PlotContext, BaseMarkProps, RawValue, ChannelAccessor } from '../types/index.js';
    import { resolveChannel, resolveProp, resolveStyles } from '../helpers/resolve.js';
    import { autoTicks } from '$lib/helpers/autoTicks.js';
    import { noTransition, testFilter } from '$lib/helpers/index.js';
    import { RAW_VALUE } from '$lib/transforms/recordize.js';
    import { getPlotDefaults } from '$lib/hooks/plotDefaults.js';
    import { uniqBy } from 'es-toolkit';

    let markProps: GridYMarkProps = $props();

    const DEFAULTS = {
        tIn: [noTransition, {}],
        tOut: [noTransition, {}],
        ...getPlotDefaults().grid,
        ...getPlotDefaults().gridY
    };

    const {
        data = [],
        automatic = false,
        ...options
    }: GridYMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

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

    const tInF = $derived(DEFAULTS.tIn?.[0] ?? noTransition);
    const tOutF = $derived(DEFAULTS.tOut?.[0] ?? noTransition);
</script>

<Mark
    type="gridY"
    data={data.length ? data.map((tick) => ({ [RAW_VALUE]: tick })) : []}
    channels={['x1', 'x2', 'y', 'stroke', 'strokeOpacity']}
    {...{ ...options, y: RAW_VALUE }}
    {automatic}>
    {#snippet children({ usedScales })}
        <g class="grid-y">
            {#each ticks as tick (tick)}
                {#if testFilter(tick, options)}
                    {@const y =
                        plot.scales.y.fn(tick) +
                        (plot.scales.y.type === 'band' ? plot.scales.y.fn.bandwidth() * 0.5 : 0)}
                    {@const x1_ = resolveChannel('x1', tick, options)}
                    {@const x2_ = resolveChannel('x2', tick, options)}
                    {@const x1 =
                        options.x1 != null ? plot.scales.x.fn(x1_) : plot.options.marginLeft}
                    {@const x2 =
                        options.x2 != null
                            ? plot.scales.x.fn(x2_)
                            : plot.options.marginLeft + plot.facetWidth}
                    {@const dx = +resolveProp(options?.dx, tick, 0)}
                    {@const dy = +resolveProp(options?.dy, tick, 0)}
                    {@const [style, styleClass] = resolveStyles(
                        plot,
                        { datum: { [RAW_VALUE]: tick } },
                        options,
                        'stroke',
                        usedScales,
                        true
                    )}
                    <line
                        in:tInF|global={{ ...(DEFAULTS.tIn?.[1] ?? {}) }}
                        out:tOutF|global={{ ...(DEFAULTS.tOut?.[1] ?? {}) }}
                        {style}
                        class={styleClass}
                        transform="translate({dx},{y + dy})"
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
