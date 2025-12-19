<!-- @component
    Creates an area chart with filled regions between two x-y value pairs
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface AreaMarkProps extends BaseMarkProps<Datum>, LinkableMarkProps<Datum> {
        data: Datum[];
        x1?: ChannelAccessor<Datum>;
        x2?: ChannelAccessor<Datum>;
        y1?: ChannelAccessor<Datum>;
        y2?: ChannelAccessor<Datum>;
        z?: ChannelAccessor<Datum>;
        curve?: CurveName | CurveFactory;
        tension?: number;
        sort?: ConstantAccessor<RawValue> | { channel: 'stroke' | 'fill' };
        stack?: Partial<StackOptions>;
        canvas?: boolean;
        areaClass?: ConstantAccessor<string, Datum>;
    }

    import Mark from '../Mark.svelte';
    import GroupMultiple from './helpers/GroupMultiple.svelte';
    import { resolveChannel, resolveProp, resolveStyles } from '../helpers/resolve.js';
    import { groups as d3Groups } from 'd3-array';
    import { area, type CurveFactory } from 'd3-shape';
    import callWithProps from '$lib/helpers/callWithProps.js';
    import { maybeCurve } from '$lib/helpers/curves.js';
    import { isValid } from '$lib/helpers/index.js';
    import AreaCanvas from './helpers/AreaCanvas.svelte';
    import Anchor from './helpers/Anchor.svelte';

    import type {
        CurveName,
        DataRecord,
        BaseMarkProps,
        ConstantAccessor,
        ChannelAccessor,
        ScaledDataRecord,
        LinkableMarkProps,
        RawValue
    } from '../types/index.js';
    import type { StackOptions } from '$lib/transforms/stack.js';
    import { addEventHandlers } from './helpers/events';
    import { getPlotDefaults } from '$lib/hooks/plotDefaults.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    let markProps: AreaMarkProps = $props();

    const DEFAULTS = {
        fill: 'currentColor',
        curve: 'linear' as CurveName,
        tension: 0,
        ...getPlotDefaults().area
    };

    const {
        data = [{} as Datum],
        /** the curve */
        curve = 'linear' as CurveName,
        tension = 0,
        class: className = '',
        areaClass,
        canvas = false,
        ...options
    }: AreaMarkProps = $derived({ ...DEFAULTS, ...markProps });

    const plot = usePlot();

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
    {...markProps}
    {...options}>
    {#snippet children({ mark, usedScales, scaledData })}
        {@const grouped = groupAndSort(scaledData)}
        {#if canvas}
            <AreaCanvas groupedAreaData={grouped} {mark} {usedScales} {areaPath} />
        {:else}
            <GroupMultiple class={className} length={grouped.length}>
                {#each grouped as areaData, i (i)}
                    {@const datum = areaData[0]}
                    {#if areaData.length > 0}
                        <Anchor {options} {datum}>
                            {@const title = resolveProp(options.title, datum.datum, '')}
                            {@const [style, styleClass] = resolveStyles(
                                plot,
                                datum,
                                options,
                                'fill',
                                usedScales
                            )}
                            <path
                                class={[
                                    'area',
                                    resolveProp(areaClass, areaData[0].datum),
                                    styleClass
                                ]}
                                clip-path={options.clipPath}
                                d={areaPath(areaData)}
                                {@attach addEventHandlers({
                                    plot,
                                    options,
                                    datum: datum?.datum
                                })}
                                {style}
                                >{#if title}<title>{title}</title>{/if}</path>
                        </Anchor>
                    {/if}
                {/each}
            </GroupMultiple>
        {/if}
    {/snippet}
</Mark>
