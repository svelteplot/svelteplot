<!-- @component
    Creates a horizontal area chart with x value and baseline.  Areas are implicitly 
    stacked horizontally if just the x channel is defined.
-->
<script lang="ts" generics="Datum extends DataRow">
    interface AreaXMarkProps extends BaseMarkProps<Datum>, LinkableMarkProps<Datum> {
        /** the input data array; each element becomes one point in the area */
        data?: Datum[];
        /** the horizontal position channel */
        x?: ChannelAccessor<Datum>;
        /** the vertical position channel */
        y?: ChannelAccessor<Datum>;
        /** the series channel; data is grouped into separate areas by unique z values */
        z?: ChannelAccessor<Datum>;
        /** the curve interpolation method for connecting data points */
        curve?: CurveName | CurveFactory;
        /** the tension parameter for cardinal or Catmull-Rom curve interpolation */
        tension?: number;
        /** controls the order of data points before rendering */
        sort?: ConstantAccessor<RawValue, Datum> | { channel: 'stroke' | 'fill' };
        /** options for stacking area data values */
        stack?: Partial<StackOptions>;
        /** if true, renders using Canvas instead of SVG */
        canvas?: boolean;
        /** CSS class name(s) to apply to individual area path elements */
        areaClass?: ConstantAccessor<string, Datum>;
    }
    import Area from './Area.svelte';
    import { renameChannels } from '../transforms/rename.js';
    import { stackX } from '../transforms/stack.js';
    import { recordizeX } from '../transforms/recordize.js';
    import type { CurveFactory } from 'd3-shape';
    import type { StackOptions } from '../transforms/stack.js';
    import type {
        BaseMarkProps,
        ChannelAccessor,
        ConstantAccessor,
        CurveName,
        DataRow,
        LinkableMarkProps,
        RawValue
    } from '../types/index.js';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';

    let markProps: AreaXMarkProps = $props();

    const DEFAULTS = getPlotDefaults().areaX;

    const {
        data = [],
        stack,
        ...options
    }: AreaXMarkProps = $derived({
        ...(markProps.x == undefined ? { x1: 0, x2: 0 } : {}),
        ...DEFAULTS,
        ...markProps
    });

    const args = $derived(
        renameChannels(stackX(recordizeX({ data, ...options, y1: null, y2: null }), stack), {
            y: 'y1'
        })
    );
</script>

<Area {...args}></Area>
