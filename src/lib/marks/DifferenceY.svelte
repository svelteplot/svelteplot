<script lang="ts" generics="Datum extends DataRecord">
    interface DifferenceYMarkProps extends Omit<BaseMarkProps<Datum>, 'fill' | 'fillOpacity'> {
        data: Datum[];
        /*
         * the horizontal position of the comparison; bound to the x scale
         */
        x1: ChannelAccessor<Datum>;
        /**
         * the horizontal position of the metric; bound to the x scale
         */
        x2: ChannelAccessor<Datum>;
        x: ChannelAccessor<Datum>;
        /**
         * the vertical position of the comparison; bound to the y scale
         */
        y1: ChannelAccessor<Datum>;
        /**
         * the vertical position of the metric; bound to the y scale
         */
        y2: ChannelAccessor<Datum>;
        y: ChannelAccessor<Datum>;
        fillOpacity?: number;
        /**
         * the stroke color of the "positive" area; defaults to 'blue'
         */
        positiveFill?: string;
        /**
         * the fill opacity of the "positive" area; defaults to 1
         */
        positiveFillOpacity?: number;
        /**
         * the stroke color of the "negative" area; defaults to 'red'
         */
        negativeFill?: string;
        /**
         * the fill opacity of the "negative" area; defaults to 1
         */
        negativeFillOpacity?: number;
        /**
         * curve type for the area; defaults to 'linear'
         */
        curve?: CurveName | CurveFactory;
        /**
         * the tension of the area curve; defaults to 0
         */
        tension?: number;
    }
    import type {
        BaseMarkProps,
        ChannelAccessor,
        CurveName,
        DataRecord
    } from 'svelteplot/types/index.js';
    import { Line, Area } from './index.js';
    import { randomId, coalesce } from '../helpers/index.js';
    import { extent, max, min } from 'd3-array';
    import { resolveChannel } from '../helpers/resolve.js';
    import type { CurveFactory } from 'd3-shape';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    const plot = usePlot();

    let markProps: DifferenceYMarkProps = $props();

    const DEFAULTS = {
        positiveFill: 'red',
        positiveFillOpacity: 1,
        negativeFill: 'blue',
        negativeFillOpacity: 1,
        curve: 'linear' as CurveName,
        tension: 0,
        ...getPlotDefaults().differenceY
    };

    const {
        data,
        stroke,
        class: className = null,
        ...options
    }: DifferenceYMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });
    const { x, x1, x2, y, y1, y2 } = $derived(options);

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
