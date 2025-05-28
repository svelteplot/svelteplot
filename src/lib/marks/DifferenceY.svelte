<script module lang="ts">
    export type DifferenceYMarkProps = Omit<BaseMarkProps, 'fill' | 'fillOpacity'> & {
        data: DataRecord[];
        /*
         * the horizontal position of the comparison; bound to the x scale
         */
        x1: ChannelAccessor;
        /**
         * the horizontal position of the metric; bound to the x scale
         */
        x2: ChannelAccessor;
        x: ChannelAccessor;
        /**
         * the vertical position of the comparison; bound to the y scale
         */
        y1: ChannelAccessor;
        /**
         * the vertical position of the metric; bound to the y scale
         */
        y2: ChannelAccessor;
        y: ChannelAccessor;
        fillOpacity?: number;
        positiveFill?: string;
        positiveFillOpacity?: number;
        negativeFill?: string;
        negativeFillOpacity?: number;
        curve?: CurveName | CurveFactory;
        tension?: number;
    };
</script>

<script lang="ts">
    import type {
        BaseMarkProps,
        ChannelAccessor,
        CurveName,
        DataRecord,
        PlotContext
    } from '$lib/types.js';
    import { Line, Area } from '$lib/index.js';
    import { randomId, coalesce } from '$lib/helpers/index.js';
    import { getContext } from 'svelte';
    import { extent, max, min } from 'd3-array';
    import { resolveChannel } from '$lib/helpers/resolve.js';
    import type { CurveFactory } from 'd3-shape';

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    let plot = $derived(getPlotState());

    let { data, stroke, class: className = null, ...options }: DifferenceYMarkProps = $props();
    let { x, x1, x2, y, y1, y2 } = $derived(options);

    const x1x2Differ = $derived((x1 == null || x2 == null) && x1 !== x2);

    const xExtent = $derived(
        x1x2Differ && x != null ? extent(data, (d) => resolveChannel('x', d, options)) : null
    );
    const x1Extent = $derived(
        x1x2Differ && x1 != null ? extent(data, (d) => resolveChannel('x1', d, options)) : null
    );
    const x2Extent = $derived(
        x1x2Differ && x2 != null ? extent(data, (d) => resolveChannel('x2', d, options)) : null
    );

    const maxMin = $derived(
        max([xExtent, x1Extent, x2Extent].filter((d) => d != null).map((d) => d[0]))
    );
    const minMax = $derived(
        min([xExtent, x1Extent, x2Extent].filter((d) => d != null).map((d) => d[1]))
    );

    const croppedX1 = $derived(
        x1x2Differ
            ? data.filter((d) => {
                  const x1val = resolveChannel(x1 != null ? 'x1' : 'x', d, options);
                  return x1val >= maxMin && x1val <= minMax;
              })
            : data
    );

    const croppedX2 = $derived(
        x1x2Differ
            ? data.filter((d) => {
                  const x2val = resolveChannel(x2 != null ? 'x2' : 'x', d, options);
                  return x2val >= maxMin && x2val <= minMax;
              })
            : data
    );

    const id = randomId();
</script>

<g class="positive difference {className || ''}">
    <!-- pos clips goes from bottom of plot area to the line 2 -->
    <clipPath id="pos-clip-{id}">
        <Area
            data={croppedX2}
            {...options}
            fill={options.positiveFill || 'red'}
            x1={coalesce(x2, x)}
            y1={coalesce(y2, y)}
            y2={{ scale: null, value: plot.options.marginTop + plot.facetHeight }} />
    </clipPath>
    <!-- pos area goes from top to line 1 -->
    <Area
        clipPath="url(#pos-clip-{id})"
        data={croppedX1}
        {...options}
        fill={options.positiveFill || 'pink'}
        fillOpacity={coalesce(options.positiveFillOpacity, options.fillOpacity, 1)}
        x1={coalesce(x1, x2, x)}
        y1={{ scale: null, value: 0 }}
        y2={coalesce(y1, x1x2Differ ? coalesce(y2, y) : 0)} />
</g>
<g class="negative difference {className || ''}">
    <!-- neg clips goes from bottom of plot area to the line 1 -->
    <clipPath id="neg-clip-{id}">
        <Area
            data={croppedX1}
            {...options}
            fill={options.negativeFill || 'blue'}
            x1={coalesce(x1, x2, x)}
            y1={coalesce(y1, x1x2Differ ? coalesce(y2, y) : 0)}
            y2={{ scale: null, value: plot.options.marginTop + plot.facetHeight }} />
    </clipPath>
    <!-- neg area goes from top to line 2 -->
    <Area
        clipPath="url(#neg-clip-{id})"
        data={croppedX2}
        {...options}
        fill={options.negativeFill || 'cyan'}
        fillOpacity={coalesce(options.negativeFillOpacity, options.fillOpacity, 1)}
        x1={coalesce(x2, x)}
        y1={{ scale: null, value: 0 }}
        y2={coalesce(y2, y)} />
</g>
{#if stroke != null}
    <!-- set stroke to false to hide the line -->
    <Line
        data={croppedX2}
        {...options}
        stroke={stroke === true ? 'currentColor' : stroke}
        x={coalesce(x2, x)}
        y={coalesce(y2, y)} />
{/if}
