<!-- 
    @component 
    Renders a simple frame around the entire plot domain 
-->
<script module lang="ts">
    export type FrameMarkProps = Omit<
        BaseMarkProps,
        'fill' | 'stroke' | 'fillOpacity' | 'strokeOpacity'
    > &
        Omit<
            BaseRectMarkProps,
            'inset' | 'insetLeft' | 'insetRight' | 'insetTop' | 'insetBottom'
        > & {
            fill: string;
            stroke: string;
            fillOpacity: number;
            strokeOpacity: number;
            automatic?: boolean;
            inset?: number;
            insetLeft?: number;
            insetRight?: number;
            insetTop?: number;
            insetBottom?: number;
        };
</script>

<script lang="ts">
    import Mark from '../Mark.svelte';
    import { getContext } from 'svelte';
    import type { PlotContext, BaseRectMarkProps } from '../types.js';
    import type { BaseMarkProps } from '../types.js';
    import RectPath from './helpers/RectPath.svelte';

    let {
        automatic,
        class: className = 'frame',
        fill,
        stroke,
        fillOpacity,
        strokeOpacity,
        ...options
    }: FrameMarkProps = $props();

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
            fallbackStyle="stroke"
            options={{ ...options, fill, stroke, fillOpacity, strokeOpacity }} />
    {/snippet}
</Mark>
