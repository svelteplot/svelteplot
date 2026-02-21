<!-- @component
    Creates an area chart with filled regions between two x-y value pairs
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface AreaMarkProps extends BaseMarkProps<Datum>, LinkableMarkProps<Datum> {
        /** the input data array; each element becomes one point in the area */
        data?: Datum[];
        /** the starting horizontal position channel for the area baseline */
        x1?: ChannelAccessor<Datum>;
        /** the ending horizontal position channel for the area topline */
        x2?: ChannelAccessor<Datum>;
        /** the starting vertical position channel for the area baseline */
        y1?: ChannelAccessor<Datum>;
        /** the ending vertical position channel for the area topline */
        y2?: ChannelAccessor<Datum>;
        /** the series channel; data is grouped into separate areas by unique z values */
        z?: ChannelAccessor<Datum>;
        /** the curve interpolation method for connecting data points */
        curve?: CurveName | CurveFactory;
        /** the tension parameter for cardinal or Catmull-Rom curve interpolation */
        tension?: number;
        /** controls the order of data points before rendering */
        sort?: ConstantAccessor<RawValue> | { channel: 'stroke' | 'fill' };
        /** options for stacking area data values */
        stack?: Partial<StackOptions>;
        /** if true, renders using Canvas instead of SVG */
        canvas?: boolean;
        /** CSS class name(s) to apply to individual area path elements */
        areaClass?: ConstantAccessor<string, Datum>;
    }

    import Mark from '../Mark.svelte';
    import GroupMultiple from './helpers/GroupMultiple.svelte';
    import { resolveChannel, resolveProp, resolveStyles } from '../helpers/resolve.js';
    import { groups as d3Groups } from 'd3-array';
    import { area, type Area, type CurveFactory } from 'd3-shape';
    import callWithProps from '../helpers/callWithProps.js';
    import { maybeCurve } from '../helpers/curves.js';
    import { isValid } from '../helpers/index.js';
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
    import type { StackOptions } from '../transforms/stack.js';
    import { addEventHandlers } from './helpers/events';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';
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
        }) as unknown as Area<ScaledDataRecord>
    );

    function groupAndSort(data: ScaledDataRecord[]) {
        const groups = groupByKey
            ? d3Groups(data, (d) => resolveProp(groupByKey, d.datum)).map((d) => d[1])
            : [data];
        if (options.sort) {
            return groups.toSorted((a, b) => {
                const av = resolveChannel('sort', a[0].datum, options) as string | number | null;
                const bv = resolveChannel('sort', b[0].datum, options) as string | number | null;
                return av! > bv! ? 1 : -1;
            });
        }
        return groups;
    }
</script>

<Mark
    type="area"
    {data}
    channels={['x1', 'x2', 'y1', 'y2', 'fill', 'stroke', 'opacity', 'fillOpacity', 'strokeOpacity']}
    required={['x1', 'y1']}
    {...(markProps as any)}
    {...(options as any)}>
    {#snippet children({ mark, usedScales, scaledData })}
        {@const grouped = groupAndSort(scaledData)}
        {#if canvas}
            <AreaCanvas groupedAreaData={grouped} {mark} {usedScales} {areaPath} />
        {:else}
            <GroupMultiple class={className} length={grouped.length}>
                {#each grouped as areaData, i (i)}
                    {@const datum = areaData[0]}
                    {#if areaData.length > 0}
                        <Anchor options={options as any} {datum}>
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
