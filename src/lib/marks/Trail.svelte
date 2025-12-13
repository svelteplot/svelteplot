<script lang="ts" generics="Datum extends DataRecord">
    interface TrailMarkProps extends Omit<
        BaseMarkProps<Datum>,
        'stroke' | 'strokeWidth' | 'strokeDasharray'
    > {
        data?: Datum[];
        x?: ChannelAccessor<Datum>;
        y?: ChannelAccessor<Datum>;
        z?: ChannelAccessor<Datum>;
        r?: ChannelAccessor<Datum>;
        curve?: CurveName | CurveFactory;
        tension?: number;
        sort?: ConstantAccessor<RawValue, Datum> | { channel: 'stroke' | 'fill' };
        defined?: ConstantAccessor<boolean, Datum>;
        canvas?: boolean;
        cap?: 'butt' | 'round';
        /**
         * Samples per segment for curve interpolation
         */
        resolution?: number | 'auto';
    }
    import type {
        DataRecord,
        ChannelAccessor,
        BaseMarkProps,
        ConstantAccessor,
        RawValue,
        PlotContext,
        ScaledDataRecord,
        CurveName
    } from 'svelteplot/types';
    import Mark from '../Mark.svelte';
    import { getContext } from 'svelte';
    import { path as d3Path } from 'd3-path';
    import { resolveProp, resolveStyles } from '../helpers/resolve.js';
    import { getPlotDefaults } from 'svelteplot/hooks/plotDefaults';
    import { sort } from 'svelteplot/transforms';
    import trailPath, { type TrailSample } from './helpers/trail.js';
    import TrailCanvas from './helpers/TrailCanvas.svelte';
    import { addEventHandlers } from './helpers/events';
    import type { CurveFactory } from 'd3-shape';

    let markProps: TrailMarkProps = $props();

    const DEFAULTS: TrailMarkProps = {
        curve: 'linear',
        r: 3,
        canvas: false,
        resolution: 'auto',
        cap: 'round',
        tension: 0,
        ...getPlotDefaults().trail
    };

    const {
        data = [{} as Datum],
        curve,
        resolution,
        tension,
        canvas,
        cap,
        class: className,
        ...options
    }: TrailMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    const args = $derived(sort({ data, ...options })) as TrailMarkProps;

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    /**
     * Groups the data by the specified key
     */
    function groupIndex(data: ScaledDataRecord[], groupByKey: ChannelAccessor<Datum> | null) {
        if (!groupByKey) return [data];
        let group: ScaledDataRecord[] = [];
        const groups = [group];
        let lastGroupValue;
        for (const d of data) {
            const groupValue = resolveProp(groupByKey, d.datum);
            if (groupValue === lastGroupValue || group.length === 0) {
                group.push(d);
                lastGroupValue = groupValue;
            } else {
                // new group
                group = [d];
                groups.push(group);
                lastGroupValue = groupValue;
            }
        }
        return groups.filter((d) => d.length > 0);
    }

    const groupByKey = $derived(args.z || args.fill) as ChannelAccessor<Datum> | null;
</script>

<Mark
    type="trail"
    channels={['x', 'y', 'opacity', 'fill', 'fillOpacity', 'r']}
    required={['x', 'y']}
    {...args}>
    {#snippet children({ mark, usedScales, scaledData })}
        {#if scaledData.length > 0}
            {@const groupedTrailData = groupIndex(scaledData, groupByKey)}
            {#if canvas}
                <!-- todo -->
                <TrailCanvas
                    {curve}
                    {cap}
                    {tension}
                    {resolution}
                    {usedScales}
                    data={groupedTrailData}
                    options={args} />
            {:else}
                <g class={['trail', className]}>
                    {#each groupedTrailData as trailData, i (i)}
                        {@const samples = trailData.map((d) => ({
                            x: Number(d.x),
                            y: Number(d.y),
                            r: Number(d.r ?? 0)
                        })) satisfies TrailSample[]}
                        {@const defined = trailData.map(
                            (d) =>
                                d.valid &&
                                d.r >= 0 &&
                                (resolveProp(options.defined, d.datum, true) ?? true)
                        )}
                        {@const pathString = trailPath(samples, defined, d3Path(), {
                            curve,
                            cap,
                            tension,
                            ...(typeof resolution === 'number'
                                ? { samplesPerSegment: resolution }
                                : {})
                        })}
                        {@const [style, styleClass] = resolveStyles(
                            plot,
                            trailData[0],
                            {
                                ...args
                            },
                            'fill',
                            usedScales
                        )}
                        <path
                            d={pathString}
                            {style}
                            class={styleClass}
                            {@attach addEventHandlers({
                                getPlotState,
                                options: mark.options,
                                datum: trailData[0].datum
                            })} />
                    {/each}
                </g>
            {/if}
        {/if}
    {/snippet}
</Mark>
