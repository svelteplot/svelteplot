<!--
    @component
    Useful for adding SVG text labels to your plot.
-->

<script lang="ts" generics="Datum extends DataRecord">
    interface TextMarkProps extends BaseMarkProps<Datum>, LinkableMarkProps<Datum> {
        data: Datum[];
        x: ChannelAccessor<Datum>;
        y: ChannelAccessor<Datum>;
        children?: Snippet;
        text: ConstantAccessor<string | null | false | undefined, Datum>;
        title?: ConstantAccessor<string, Datum>;
        /**
         * the font size of the text
         */
        fontSize?: ConstantAccessor<number, Datum>;
        /**
         * if you want to apply class names to individual text elements
         */
        textClass?: ConstantAccessor<string, Datum>;
        /**
         * the line anchor for vertical position; top, bottom, or middle
         */
        lineAnchor?: ConstantAccessor<'bottom' | 'top' | 'middle', Datum>;
        frameAnchor?: ConstantAccessor<
            | 'bottom'
            | 'top'
            | 'left'
            | 'right'
            | 'top-left'
            | 'bottom-left'
            | 'top-right'
            | 'bottom-right',
            Datum
        >;
    }

    import { getContext, type Snippet } from 'svelte';
    import GroupMultiple from './helpers/GroupMultiple.svelte';
    import type {
        PlotContext,
        DataRecord,
        BaseMarkProps,
        ConstantAccessor,
        ChannelAccessor,
        PlotDefaults,
        TransformArg,
        RawValue,
        LinkableMarkProps
    } from '../types.js';
    import { resolveProp, resolveStyles } from '../helpers/resolve.js';
    import Mark from '../Mark.svelte';
    import { sort } from '$lib/index.js';
    import Anchor from './helpers/Anchor.svelte';

    const DEFAULTS = {
        fontSize: 12,
        fontWeight: 500,
        strokeWidth: 1.6,
        ...getContext<PlotDefaults>('svelteplot/_defaults').text
    };

    let markProps: TextMarkProps = $props();

    const {
        data = [{} as Datum],
        class: className = '',
        ...options
    }: TextMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    let plot = $derived(getPlotState());

    const LINE_ANCHOR = {
        bottom: 'auto',
        middle: 'central',
        top: 'hanging'
    } as const;

    const args = $derived(
        sort({
            data,
            ...options
        } as unknown as TransformArg<DataRecord>)
    );
</script>

<Mark
    type="text"
    channels={[
        'x',
        'y',
        'r',
        'symbol',
        'fill',
        'stroke',
        'opacity',
        'strokeOpacity',
        'fillOpacity'
    ]}
    required={['x', 'y']}
    {...args as unknown as TextMarkProps}>
    {#snippet children({ mark, scaledData, usedScales })}
        <GroupMultiple class="text {className}" length={className ? 2 : args.data.length}>
            {#each scaledData as d, i (i)}
                {#if d.valid}
                    {@const title = resolveProp(args.title, d.datum, '')}
                    {@const frameAnchor = resolveProp(args.frameAnchor, d.datum)}
                    {@const isLeft =
                        frameAnchor === 'left' ||
                        frameAnchor === 'top-left' ||
                        frameAnchor === 'bottom-left'}
                    {@const isRight =
                        frameAnchor === 'right' ||
                        frameAnchor === 'top-right' ||
                        frameAnchor === 'bottom-right'}
                    {@const isTop =
                        frameAnchor === 'top' ||
                        frameAnchor === 'top-left' ||
                        frameAnchor === 'top-right'}
                    {@const isBottom =
                        frameAnchor === 'bottom' ||
                        frameAnchor === 'bottom-left' ||
                        frameAnchor === 'bottom-right'}
                    {@const [x, y] =
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
                              ]}

                    {@const dx = +resolveProp(args.dx, d.datum, 0)}
                    {@const dy = +resolveProp(args.dy, d.datum, 0)}
                    {@const textLines = String(resolveProp(args.text, d.datum, '')).split('\n')}
                    {@const lineAnchor = resolveProp(
                        args.lineAnchor,
                        d.datum,
                        args.y != null ? 'middle' : isTop ? 'top' : isBottom ? 'bottom' : 'middle'
                    )}
                    {@const textClassName = resolveProp(args.textClass, d.datum, null)}

                    {@const [style, styleClass] = resolveStyles(
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
                    )}

                    <Anchor {options} datum={d?.datum}>
                        {#if textLines.length > 1}
                            <!-- multiline text-->
                            {@const fontSize = resolveProp(args.fontSize, d.datum) || 12}
                            <text
                                class={[textClassName]}
                                dominant-baseline={LINE_ANCHOR[lineAnchor]}
                                transform="translate({Math.round(x + dx)},{Math.round(
                                    y +
                                        dy -
                                        (lineAnchor === 'bottom'
                                            ? textLines.length - 1
                                            : lineAnchor === 'middle'
                                              ? (textLines.length - 1) * 0.5
                                              : 0) *
                                            fontSize
                                )})"
                                >{#each textLines as line, l (l)}<tspan
                                        x="0"
                                        dy={l ? fontSize : 0}
                                        class={styleClass}
                                        {style}>{line}</tspan
                                    >{/each}{#if title}<title>{title}</title>{/if}</text>
                        {:else}
                            <!-- singleline text-->
                            <text
                                class={[textClassName, styleClass]}
                                dominant-baseline={LINE_ANCHOR[lineAnchor]}
                                transform="translate({Math.round(x + dx)},{Math.round(y + dy)})"
                                {style}
                                >{textLines[0]}{#if title}<title>{title}</title>{/if}</text>
                        {/if}
                    </Anchor>
                {/if}
            {/each}
        </GroupMultiple>
    {/snippet}
</Mark>

<style>
    text {
        paint-order: stroke fill;
    }
</style>
