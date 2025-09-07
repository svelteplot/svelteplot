<script lang="ts">
    import { resolveProp, resolveStyles } from 'svelteplot/helpers/resolve';
    import { getContext, type ComponentProps } from 'svelte';
    import type { PlotContext, ScaledDataRecord, UsedScales } from '$lib/index.js';
    import type Text from '../Text.svelte';
    import { CSS_VAR } from 'svelteplot/constants';
    import { maybeFromPixel, maybeFromRem } from 'svelteplot/helpers/getBaseStyles';

    const LINE_ANCHOR = {
        bottom: 'auto',
        middle: 'central',
        top: 'hanging'
    } as const;

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    let {
        textLines,
        d,
        args,
        usedScales
    }: {
        textLines: string[];
        d: ScaledDataRecord;
        args: ComponentProps<typeof Text>;
        usedScales: UsedScales;
    } = $props();

    const title = $derived(resolveProp(args.title, d.datum, ''));
    const frameAnchor = $derived(resolveProp(args.frameAnchor, d.datum));
    const isLeft = $derived(
        frameAnchor === 'left' || frameAnchor === 'top-left' || frameAnchor === 'bottom-left'
    );
    const isRight = $derived(
        frameAnchor === 'right' || frameAnchor === 'top-right' || frameAnchor === 'bottom-right'
    );
    const isTop = $derived(
        frameAnchor === 'top' || frameAnchor === 'top-left' || frameAnchor === 'top-right'
    );
    const isBottom = $derived(
        frameAnchor === 'bottom' || frameAnchor === 'bottom-left' || frameAnchor === 'bottom-right'
    );
    const lineAnchor = $derived(
        resolveProp(
            args.lineAnchor,
            d.datum,
            args.y != null ? 'middle' : isTop ? 'top' : isBottom ? 'bottom' : 'middle'
        )
    );
    const textClassName = $derived(resolveProp(args.textClass, d.datum, null));
    const [x, y] = $derived(
        args.x != null && args.y != null
            ? [d.x, d.y]
            : [
                  args.x != null
                      ? d.x
                      : isLeft
                        ? plot.options.marginLeft
                        : isRight
                          ? plot.options.marginLeft + plot.facetWidth
                          : plot.options.marginLeft + plot.facetWidth * 0.5,
                  args.y != null
                      ? d.y
                      : isTop
                        ? plot.options.marginTop
                        : isBottom
                          ? plot.options.marginTop + plot.facetHeight
                          : plot.options.marginTop + plot.facetHeight * 0.5
              ]
    );

    const [style, styleClass] = $derived(
        resolveStyles(
            plot,
            { ...d, __tspanIndex: 0 },
            {
                fontSize: 12,
                fontWeight: 500,
                strokeWidth: 1.6,
                textAnchor: isLeft ? 'start' : isRight ? 'end' : 'middle',
                ...args
            },
            'fill',
            usedScales
        )
    );

    const fontSize = $derived(
        textLines.length > 1 ? (resolveProp(args.fontSize, d.datum) ?? 12) : 0
    );
    let textElement: SVGTextElement | null = $state(null);

    const rootFontSize = $derived(
        textElement?.ownerDocument?.documentElement && textLines.length > 1
            ? maybeFromPixel(getComputedStyle(textElement.ownerDocument.documentElement).fontSize)
            : 14
    );

    const computedFontSize = $derived(
        textElement && textLines.length > 1 && CSS_VAR.test(fontSize)
            ? maybeFromRem(
                  maybeFromPixel(
                      getComputedStyle(textElement).getPropertyValue(
                          `--${fontSize.match(CSS_VAR)[1]}`
                      )
                  ),
                  rootFontSize
              )
            : fontSize
    );

    const lineHeight = $derived(
        textLines.length > 1 ? (resolveProp(args.lineHeight, d.datum) ?? 1.2) : 0
    );

    const rotate = $derived(+resolveProp(args.rotate, d.datum, 0));
</script>

{#if textLines.length > 1}
    <!-- multiline text-->
    <text
        bind:this={textElement}
        class={[textClassName]}
        dominant-baseline={LINE_ANCHOR[lineAnchor]}
        transform="translate({Math.round(x)},{Math.round(
            y -
                (lineAnchor === 'bottom'
                    ? textLines.length - 1
                    : lineAnchor === 'middle'
                      ? (textLines.length - 1) * 0.5
                      : 0) *
                    computedFontSize *
                    lineHeight
        )}) rotate({rotate})"
        >{#each textLines as line, l (l)}<tspan
                x="0"
                dy={l ? computedFontSize * lineHeight : 0}
                class={styleClass}
                {style}>{line}</tspan
            >{/each}{#if title}<title>{title}</title>{/if}</text>
{:else}
    <!-- singleline text-->
    <text
        class={[textClassName, styleClass]}
        dominant-baseline={LINE_ANCHOR[lineAnchor]}
        transform="translate({Math.round(x)},{Math.round(y)}) rotate({rotate})"
        {style}
        >{textLines[0]}{#if title}<title>{title}</title>{/if}</text>
{/if}

<style>
    text {
        paint-order: stroke fill;
    }
</style>
