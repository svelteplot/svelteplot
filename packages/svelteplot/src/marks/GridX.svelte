<!-- @component
    Renders vertical gridlines at x-axis tick positions
-->
<script lang="ts" generics="Datum = RawValue">
    interface GridXMarkProps extends Omit<BaseMarkProps<Datum>, 'fill' | 'fillOpacity'> {
        /** custom values at which to draw vertical gridlines */
        data?: Datum[];
        /** whether these gridlines were automatically added by the Plot component */
        automatic?: boolean;
        /** the starting vertical position of the gridline */
        y1?: ChannelAccessor<Datum>;
        /** the ending vertical position of the gridline */
        y2?: ChannelAccessor<Datum>;
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
    import isDataRecord from '../helpers/isDataRecord';
    import { INDEX } from '../constants';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    let markProps: GridXMarkProps = $props();

    const _plotDefaults = getPlotDefaults();
    const _grid = _plotDefaults.grid;
    const _gridX = _plotDefaults.gridX;
    const DEFAULTS = {
        ...(_grid != null && _grid !== true ? _grid : {}),
        ...(_gridX != null && _gridX !== true ? _gridX : {})
    };

    const {
        data = [],
        automatic = false,
        ...options
    }: GridXMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    const plot = usePlot();

    const autoTickCount = $derived(
        Math.max(3, Math.round(plot.facetWidth / plot.options.x.tickSpacing))
    );

    const ticks: DataRecord[] = $derived(
        (data.length > 0
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
        ).map((d, i) =>
            isDataRecord(d) ? { ...d, [INDEX]: i } : { [RAW_VALUE]: d as RawValue, [INDEX]: i }
        ) as DataRecord[]
    );
</script>

<Mark
    type="gridX"
    data={data.length ? data.map((tick) => ({ [RAW_VALUE]: tick as RawValue })) : []}
    channels={['y1', 'y2', 'x', 'stroke', 'strokeOpacity']}
    {...{ ...options, x: RAW_VALUE } as any}
    {automatic}>
    {#snippet children({ usedScales })}
        <g class="grid-x">
            {#each ticks as tick, t (t)}
                {#if testFilter(tick as any, options as any)}
                    {@const x =
                        plot.scales.x.fn(tick[RAW_VALUE]) +
                        (plot.scales.x.type === 'band' ? plot.scales.x.fn.bandwidth() * 0.5 : 0)}
                    {@const y1_ = resolveChannel('y1', tick as any, options as any)}
                    {@const y2_ = resolveChannel('y2', tick as any, options as any)}
                    {@const dx = resolveProp(options.dx, tick as any, 0) ?? 0}
                    {@const dy = resolveProp(options.dy, tick as any, 0) ?? 0}
                    {@const y1 =
                        options.y1 != null && y1_ != null
                            ? plot.scales.y.fn(y1_)
                            : plot.options.marginTop}
                    {@const y2 =
                        options.y2 != null && y2_ != null
                            ? plot.scales.y.fn(y2_)
                            : plot.options.marginTop + plot.facetHeight}
                    {@const [style, styleClass] = resolveStyles(
                        plot,
                        { datum: tick } as ScaledDataRecord,
                        options,
                        'stroke',
                        usedScales,
                        true
                    )}
                    <line
                        class={styleClass}
                        transform="translate({x + dx},{dy})"
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
