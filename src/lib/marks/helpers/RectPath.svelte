<!-- @component
Helper component for rendering rectangular marks in SVG
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface RectPathProps {
        datum: ScaledDataRecord<Datum>;
        class: string | null;
        x: number;
        y: number;
        width: number;
        height: number;
        options: BaseRectMarkProps<Datum> & BaseMarkProps<Datum>;
        /**
         * By default, the `inset` property is applied to all four insets. Mark components
         * can tweak this behavior for insetTop and insetBottom by setting the
         * useInsetAsFallbackVertically prop to false.
         */
        useInsetAsFallbackVertically?: boolean;
        /**
         * By default, the `inset` property is applied to all four insets. Mark components
         * can tweak this behavior for insetLeft and insetRight by setting the
         * useInsetAsFallbackHorizontally prop to false.
         */
        useInsetAsFallbackHorizontally?: boolean;
        usedScales: UsedScales;
        fallbackStyle?: 'fill' | 'stroke';
    }

    import { resolveProp, resolveStyles } from 'svelteplot/helpers/resolve';
    import { roundedRect } from 'svelteplot/helpers/roundedRect';
    import type {
        BaseMarkProps,
        BaseRectMarkProps,
        BorderRadius,
        ScaledDataRecord,
        UsedScales,
        PlotContext,
        DataRecord
    } from '$lib/index.js';
    import { addEventHandlers } from './events.js';
    import { getContext } from 'svelte';
    import Anchor from './Anchor.svelte';

    let {
        datum,
        options,
        class: className = null,
        x,
        y,
        width,
        height,
        useInsetAsFallbackVertically = true,
        useInsetAsFallbackHorizontally = true,
        usedScales,
        fallbackStyle = 'fill'
    }: RectPathProps = $props();

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    const dx = $derived(+(resolveProp(options.dx, datum?.datum, 0) as number));
    const dy = $derived(+(resolveProp(options.dy, datum?.datum, 0) as number));
    const inset = $derived(+(resolveProp(options.inset, datum?.datum, 0) as number));
    const insetLeft = $derived(
        +(resolveProp(
            options.insetLeft,
            datum?.datum,
            useInsetAsFallbackHorizontally ? inset : 0
        ) as number)
    );
    const insetRight = $derived(
        +(resolveProp(
            options.insetRight,
            datum?.datum,
            useInsetAsFallbackHorizontally ? inset : 0
        ) as number)
    );
    const insetTop = $derived(
        +(resolveProp(
            options.insetTop,
            datum?.datum,
            useInsetAsFallbackVertically ? inset : 0
        ) as number)
    );
    const insetBottom = $derived(
        +(resolveProp(
            options.insetBottom,
            datum?.datum,
            useInsetAsFallbackVertically ? inset : 0
        ) as number)
    );
    const borderRadius = $derived((options.borderRadius ?? 0) as BorderRadius);
    const hasBorderRadius = $derived(
        (typeof borderRadius === 'number' && borderRadius > 0) ||
            (typeof borderRadius === 'object' &&
                Math.max(
                    borderRadius.topRight ?? 0,
                    borderRadius.bottomRight ?? 0,
                    borderRadius.topLeft ?? 0,
                    borderRadius.bottomLeft ?? 0
                ) > 0)
    );
    const [style, styleClass] = $derived(
        resolveStyles(plot, datum, options, fallbackStyle, usedScales)
    );
</script>

<Anchor {options} datum={datum?.datum}>
    {#if hasBorderRadius}
        <path
            transform="translate({x + dx + insetLeft},{y + insetBottom + dy})"
            d={roundedRect(
                0,
                0,
                width - insetLeft - insetRight,
                height - insetTop - insetBottom,
                borderRadius
            )}
            class={[styleClass, className]}
            {style}
            use:addEventHandlers={{
                getPlotState,
                options,
                datum: datum?.datum
            }} />
    {:else}
        <rect
            transform="translate({x + dx + insetLeft},{y + insetBottom + dy})"
            width={width - insetLeft - insetRight}
            height={height - insetTop - insetBottom}
            class={[styleClass, className]}
            {style}
            use:addEventHandlers={{
                getPlotState,
                options,
                datum: datum?.datum
            }} />
    {/if}
</Anchor>
