<!-- 
    @component 
    Renders a simple frame around the entire plot domain 
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface FrameMarkProps
        extends Omit<BaseMarkProps<Datum>, 'fill' | 'stroke' | 'fillOpacity' | 'strokeOpacity'>,
            BaseRectMarkProps<Datum>,
            LinkableMarkProps<Datum> {
        fill?: string;
        stroke?: string;
        fillOpacity?: number;
        strokeOpacity?: number;
        automatic?: boolean;
        inset?: number;
        insetLeft?: number;
        insetRight?: number;
        insetTop?: number;
        insetBottom?: number;
    }
    import Mark from '../Mark.svelte';
    import { getContext } from 'svelte';
    import type {
        PlotContext,
        BaseRectMarkProps,
        LinkableMarkProps,
        PlotDefaults,
        DataRecord
    } from '../types/index.js';
    import type { BaseMarkProps } from '../types/index.js';
    import RectPath from './helpers/RectPath.svelte';

    let markProps: FrameMarkProps = $props();

    const DEFAULTS: FrameMarkProps = {
        fill: undefined,
        class: 'frame',
        stroke: undefined,
        fillOpacity: 1,
        strokeOpacity: 1,
        ...getContext<PlotDefaults>('svelteplot/_defaults').frame
    };

    const {
        automatic,
        class: className,
        fill,
        stroke,
        fillOpacity,
        strokeOpacity,
        ...options
    }: FrameMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());
</script>

<Mark type="frame" {automatic}>
    {#snippet children({ usedScales })}
        <RectPath
            class={className}
            datum={{ fill, stroke, fillOpacity, strokeOpacity, datum: {}, valid: true }}
            x={plot.options.marginLeft}
            y={plot.options.marginTop}
            width={plot.facetWidth}
            height={plot.facetHeight}
            {usedScales}
            fallbackStyle={fill == null || fill === 'none' ? 'stroke' : 'fill'}
            options={{ ...options, fill, stroke, fillOpacity, strokeOpacity }} />
    {/snippet}
</Mark>
