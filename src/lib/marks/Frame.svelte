<!-- 
    @component 
    Renders a simple frame around the entire plot domain 
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface FrameMarkProps
        extends
            Omit<BaseMarkProps<Datum>, 'fill' | 'stroke' | 'fillOpacity' | 'strokeOpacity'>,
            BaseRectMarkProps<Datum>,
            LinkableMarkProps<Datum> {
        /** the fill color of the frame; true maps to 'currentColor' */
        fill?: string | boolean;
        /** the stroke color of the frame; true maps to 'currentColor' */
        stroke?: string | boolean;
        /** the fill opacity of the frame */
        fillOpacity?: number;
        /** the stroke opacity of the frame */
        strokeOpacity?: number;
        /** the overall opacity of the frame */
        opacity?: number;
        /** whether this frame was automatically added by the Plot component */
        automatic?: boolean;
        /** shorthand to inset the frame from all edges, in pixels */
        inset?: number;
        /** inset the frame from the left edge, in pixels */
        insetLeft?: number;
        /** inset the frame from the right edge, in pixels */
        insetRight?: number;
        /** inset the frame from the top edge, in pixels */
        insetTop?: number;
        /** inset the frame from the bottom edge, in pixels */
        insetBottom?: number;
    }
    import Mark from '../Mark.svelte';
    import type {
        BaseRectMarkProps,
        LinkableMarkProps,
        DataRecord,
        ScaledDataRecord
    } from '../types/index.js';
    import type { BaseMarkProps } from '../types/index.js';
    import RectPath from './helpers/RectPath.svelte';
    import { resolveProp } from 'svelteplot/helpers/resolve';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    let markProps: FrameMarkProps = $props();

    const _plotDefaults = getPlotDefaults();
    const _frame = _plotDefaults.frame;
    const DEFAULTS: FrameMarkProps = {
        fill: undefined,
        class: 'frame',
        stroke: undefined,
        fillOpacity: 1,
        strokeOpacity: 1,
        ...(_frame != null && _frame !== true ? _frame : {})
    };

    const {
        automatic,
        class: className,
        fill,
        stroke,
        opacity,
        fillOpacity,
        strokeOpacity,
        ...options
    }: FrameMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    const dx = $derived(resolveProp(options.dx, null, 0) || 0);
    const dy = $derived(resolveProp(options.dy, null, 0) || 0);

    const resolvedFill = $derived(fill === true ? 'currentColor' : (fill as string | undefined));
    const resolvedStroke = $derived(
        stroke === true ? 'currentColor' : (stroke as string | undefined)
    );

    const plot = usePlot();
</script>

<Mark type="frame" {automatic}>
    {#snippet children({ usedScales })}
        <RectPath
            class={className ?? null}
            datum={{
                fill: resolvedFill,
                stroke: resolvedStroke,
                fillOpacity,
                strokeOpacity,
                opacity,
                datum: {} as Datum,
                valid: true
            } as unknown as ScaledDataRecord<Datum>}
            x={plot.options.marginLeft + dx}
            y={plot.options.marginTop + dy}
            width={plot.facetWidth}
            height={plot.facetHeight}
            {usedScales}
            fallbackStyle={resolvedFill == null || resolvedFill === 'none' ? 'stroke' : 'fill'}
            options={{
                ...options,
                fill: resolvedFill,
                stroke: resolvedStroke,
                fillOpacity,
                opacity,
                strokeOpacity
            }} />
    {/snippet}
</Mark>
