<!-- @component
    Renders horizontal gridlines at y-axis tick positions
-->
<script lang="ts" generics="Datum = RawValue">
    interface GridYMarkProps extends Omit<BaseMarkProps<Datum>, 'fill' | 'fillOpacity'> {
        /** custom values at which to draw horizontal gridlines */
        data?: Datum[];
        /** whether these gridlines were automatically added by the Plot component */
        automatic?: boolean;
        /** the starting horizontal position of the gridline */
        x1?: ChannelAccessor<Datum>;
        /** the ending horizontal position of the gridline */
        x2?: ChannelAccessor<Datum>;
    }
    import Mark from '../Mark.svelte';
    import type {
        BaseMarkProps,
        RawValue,
        DataRecord,
        ChannelAccessor,
        ScaledDataRecord
    } from '../types/index.js';
    import { resolveChannel, resolveProp, resolveStyles } from '../helpers/resolve.js';
    import { autoTicks } from '../helpers/autoTicks.js';
    import { testFilter } from '../helpers/index.js';
    import { RAW_VALUE } from '../transforms/recordize.js';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    let markProps: GridYMarkProps = $props();

    const _plotDefaults = getPlotDefaults();
    const _grid = _plotDefaults.grid;
    const _gridY = _plotDefaults.gridY;
    const DEFAULTS = {
        ...(_grid != null && _grid !== true ? _grid : {}),
        ...(_gridY != null && _gridY !== true ? _gridY : {})
    };

    const {
        data = [],
        automatic = false,
        ...options
    }: GridYMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    const plot = usePlot();

    const autoTickCount = $derived(
        Math.max(2, Math.round(plot.facetHeight / plot.options.y.tickSpacing))
    );

    const ticks: RawValue[] = $derived(
        data.length > 0
            ? // use custom tick values if user passed any as prop
              (data as RawValue[])
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
    data={data.length ? data.map((tick) => ({ [RAW_VALUE]: tick as RawValue })) : []}
    channels={['x1', 'x2', 'y', 'stroke', 'strokeOpacity']}
    {...{ ...options, y: RAW_VALUE } as any}
    {automatic}>
    {#snippet children({ usedScales })}
        <g class="grid-y">
            {#each ticks as tick, t (t)}
                {#if testFilter(tick as any, options as any)}
                    {@const y =
                        plot.scales.y.fn(tick) +
                        (plot.scales.y.type === 'band' ? plot.scales.y.fn.bandwidth() * 0.5 : 0)}
                    {@const x1_ = resolveChannel('x1', tick as any, options as any)}
                    {@const x2_ = resolveChannel('x2', tick as any, options as any)}
                    {@const x1 =
                        options.x1 != null && x1_ != null
                            ? plot.scales.x.fn(x1_)
                            : plot.options.marginLeft}
                    {@const x2 =
                        options.x2 != null && x2_ != null
                            ? plot.scales.x.fn(x2_)
                            : plot.options.marginLeft + plot.facetWidth}
                    {@const dx = resolveProp(options.dx, tick as any, 0) ?? 0}
                    {@const dy = resolveProp(options.dy, tick as any, 0) ?? 0}
                    {@const [style, styleClass] = resolveStyles(
                        plot,
                        { datum: { [RAW_VALUE]: tick } } as unknown as ScaledDataRecord,
                        options as any,
                        'stroke',
                        usedScales,
                        true
                    )}
                    <line
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
