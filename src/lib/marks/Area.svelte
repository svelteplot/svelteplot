<!-- @component
    Creates an area chart with filled regions between two x-y value pairs
-->
<script module lang="ts">
    export type AreaMarkProps = {
        data: DataRecord[];
        x1?: ChannelAccessor;
        x2?: ChannelAccessor;
        y1?: ChannelAccessor;
        y2?: ChannelAccessor;
        z?: ChannelAccessor;
        curve?: CurveName | CurveFactory;
        tension?: number;
        sort?: ConstantAccessor<RawValue> | { channel: 'stroke' | 'fill' };
        stack?: Partial<StackOptions>;
        canvas?: boolean;
    } & BaseMarkProps &
        LinkableMarkProps;
</script>

<script lang="ts">
    import Mark from '../Mark.svelte';
    import GroupMultiple from './helpers/GroupMultiple.svelte';
    import { getContext } from 'svelte';
    import { resolveChannel, resolveProp, resolveStyles } from '../helpers/resolve.js';
    import { groups as d3Groups } from 'd3-array';
    import { area, type CurveFactory } from 'd3-shape';
    import callWithProps from '$lib/helpers/callWithProps.js';
    import { maybeCurve } from '$lib/helpers/curves.js';
    import { isValid } from '$lib/helpers/index.js';
    import AreaCanvas from './helpers/AreaCanvas.svelte';

    import type {
        CurveName,
        PlotContext,
        DataRecord,
        BaseMarkProps,
        ConstantAccessor,
        ChannelAccessor,
        FacetContext,
        ScaledDataRecord,
        LinkableMarkProps
    } from '../types.js';
    import type { RawValue } from '$lib/types.js';
    import type { StackOptions } from '$lib/transforms/stack.js';

    let {
        data,
        /** the curve */
        curve = 'linear',
        tension = 0,
        class: className = '',
        canvas = false,
        ...options
    }: AreaMarkProps = $props();

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    const groupByKey = $derived(options.z || options.fill || options.stroke);

    const areaPath = $derived(
        callWithProps(area, [], {
            curve: maybeCurve(curve, tension),
            defined: (d: ScaledDataRecord) =>
                options.x1 != null && options.x2 != null
                    ? // vertical
                      isValid(d.y1) && isValid(d.x1) && isValid(d.x2)
                    : // horizontal
                      isValid(d.x1) && isValid(d.y1) && isValid(d.y2),
            ...(options.x1 != null && options.x2 != null
                ? {
                      // "vertical" area
                      x0: (d: ScaledDataRecord) => d.x1,
                      x1: (d: ScaledDataRecord) => d.x2,
                      y: (d: ScaledDataRecord) => d.y1
                  }
                : {
                      // "horizontal" area
                      x: (d: ScaledDataRecord) => d.x1,
                      y0: (d: ScaledDataRecord) => d.y1,
                      y1: (d: ScaledDataRecord) => d.y2
                  })
        })
    );

    function groupAndSort(data: ScaledDataRecord[]) {
        const groups = groupByKey
            ? d3Groups(data, (d) => resolveProp(groupByKey, d.datum)).map((d) => d[1])
            : [data];
        if (options.sort) {
            return groups.toSorted((a, b) =>
                resolveChannel('sort', a[0].datum, options) >
                resolveChannel('sort', b[0].datum, options)
                    ? 1
                    : -1
            );
        }
        return groups;
    }
</script>

<Mark
    type="area"
    {data}
    channels={['x1', 'x2', 'y1', 'y2', 'fill', 'stroke', 'opacity', 'fillOpacity', 'strokeOpacity']}
    required={['x1', 'y1']}
    {...options}>
    {#snippet children({ mark, usedScales, scaledData })}
        {@const grouped = groupAndSort(scaledData)}
        {#if canvas}
            <AreaCanvas groupedAreaData={grouped} {mark} {usedScales} {areaPath} />
        {:else}
            <GroupMultiple length={grouped.length}>
                {#each grouped as areaData, i (i)}
                    {#snippet el(datum: ScaledDataRecord)}
                        {@const title = resolveProp(options.title, datum.datum, '')}
                        {@const [style, styleClass] = resolveStyles(
                            plot,
                            datum,
                            options,
                            'fill',
                            usedScales
                        )}
                        <path
                            class={['svelteplot-area', className, styleClass]}
                            clip-path={options.clipPath}
                            d={areaPath(areaData)}
                            {style}
                            >{#if title}<title>{title}</title>{/if}</path>
                    {/snippet}
                    {#if areaData.length > 0}
                        {#if options.href}
                            <a
                                href={resolveProp(options.href, areaData[0].datum, '')}
                                target={resolveProp(options.target, areaData[0].datum, '_self')}>
                                {@render el(areaData[0])}
                            </a>
                        {:else}
                            {@render el(areaData[0])}
                        {/if}
                    {/if}
                {/each}
            </GroupMultiple>
        {/if}
    {/snippet}
</Mark>
