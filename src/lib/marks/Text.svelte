<!--
    @component
    Useful for adding SVG text labels to your plot.
-->

<script lang="ts" generics="Datum extends DataRecord">
    import type * as CSS from 'csstype';

    interface TextMarkProps extends BaseMarkProps<Datum>, LinkableMarkProps<Datum> {
        data?: Datum[];
        x?: ChannelAccessor<Datum>;
        y?: ChannelAccessor<Datum>;
        children?: Snippet;
        text: ConstantAccessor<string | null | false | undefined, Datum>;
        title?: ConstantAccessor<string, Datum>;
        /**
         * the font size of the text
         */
        fontFamily?: ConstantAccessor<CSS.Property.FontFamily, Datum>;
        fontSize?: ConstantAccessor<CSS.Property.FontSize | number, Datum>;
        fontWeight?: ConstantAccessor<CSS.Property.FontWeight, Datum>;
        fontStyle?: ConstantAccessor<CSS.Property.FontStyle, Datum>;
        fontVariant?: ConstantAccessor<CSS.Property.FontVariant, Datum>;
        letterSpacing?: ConstantAccessor<CSS.Property.LetterSpacing, Datum>;
        wordSpacing?: ConstantAccessor<CSS.Property.WordSpacing, Datum>;
        textTransform?: ConstantAccessor<CSS.Property.TextTransform, Datum>;
        textDecoration?: ConstantAccessor<CSS.Property.TextDecoration, Datum>;
        /**
         * if you want to apply class names to individual text elements
         */
        textClass?: ConstantAccessor<string, Datum>;
        /**
         * the line anchor for vertical position; top, bottom, or middle
         */
        lineAnchor?: ConstantAccessor<'bottom' | 'top' | 'middle'>;
        /**
         * line height as multiplier of font size
         * @default 1.2
         */
        lineHeight?: ConstantAccessor<number, Datum>;
        frameAnchor?: ConstantAccessor<
            | 'bottom'
            | 'top'
            | 'left'
            | 'right'
            | 'top-left'
            | 'bottom-left'
            | 'top-right'
            | 'bottom-right'
            | 'middle',
            Datum
        >;
        /**
         * rotate text by angle in degrees
         */
        rotate?: ConstantAccessor<number, Datum>;
    }

    import { getContext, type Snippet } from 'svelte';
    import GroupMultiple from './helpers/GroupMultiple.svelte';
    import type {
        DataRecord,
        BaseMarkProps,
        ConstantAccessor,
        ChannelAccessor,
        PlotDefaults,
        LinkableMarkProps
    } from '../types/index.js';
    import { resolveProp, resolveStyles } from '../helpers/resolve.js';
    import Mark from '../Mark.svelte';
    import { sort } from '$lib/index.js';

    import MultilineText from './helpers/MultilineText.svelte';
    import { indexData } from 'svelteplot/transforms/recordize';

    const DEFAULTS = {
        fontSize: 12,
        c: 500,
        strokeWidth: 1.6,
        frameAnchor: 'middle' as const,
        lineHeight: 1.1,
        rotate: 0,
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

    const args = $derived(
        sort({
            data: indexData(data),
            ...options
        })
    ) as TextMarkProps;
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
    required={[]}
    {...args}>
    {#snippet children({ mark, scaledData, usedScales })}
        <GroupMultiple class="text {className}" length={className ? 2 : args.data.length}>
            {#each scaledData as d, i (i)}
                {#if d.valid}
                    {@const textLines = String(resolveProp(args.text, d.datum, '')).split('\n')}

                    <MultilineText {textLines} {d} {args} {usedScales} />
                {/if}
            {/each}
        </GroupMultiple>
    {/snippet}
</Mark>
