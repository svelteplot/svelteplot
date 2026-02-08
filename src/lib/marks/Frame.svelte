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
        fill?: string;
        stroke?: string;
        fillOpacity?: number;
        strokeOpacity?: number;
        opacity?: number;
        automatic?: boolean;
        inset?: number;
        insetLeft?: number;
        insetRight?: number;
        insetTop?: number;
        insetBottom?: number;
    }
    import Mark from '../Mark.svelte';
    import type { BaseRectMarkProps, LinkableMarkProps, DataRecord } from '../types/index.js';
    import type { BaseMarkProps } from '../types/index.js';
    import RectPath from './helpers/RectPath.svelte';
    import { resolveProp } from 'svelteplot/helpers/resolve';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    let markProps: FrameMarkProps = $props();

    const DEFAULTS: FrameMarkProps = {
        fill: undefined,
        class: 'frame',
        stroke: undefined,
        fillOpacity: 1,
        strokeOpacity: 1,
        ...getPlotDefaults().frame
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

    const plot = usePlot();
</script>

<Mark type="frame" {automatic}>
    {#snippet children({ usedScales })}
        <RectPath
            class={className}
            datum={{ fill, stroke, fillOpacity, strokeOpacity, opacity, datum: {}, valid: true }}
            x={plot.options.marginLeft + dx}
            y={plot.options.marginTop + dy}
            width={plot.facetWidth}
            height={plot.facetHeight}
            {usedScales}
            fallbackStyle={fill == null || fill === 'none' ? 'stroke' : 'fill'}
            options={{ ...options, fill, stroke, fillOpacity, opacity, strokeOpacity }} />
    {/snippet}
</Mark>
