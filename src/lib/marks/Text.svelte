<!--
    @component
    Useful for adding SVG text labels to your plot.
-->

<script lang="ts" generics="Datum = DataRecord | GeoJSON.GeoJsonObject">
    import type * as CSS from 'csstype';

    interface TextCommonMarkProps extends BaseMarkProps<Datum>, LinkableMarkProps<Datum> {
        /** the input data array; each element becomes one text label */
        data?: Datum[];
        /** the horizontal position channel */
        x?: ChannelAccessor<Datum>;
        /** the vertical position channel */
        y?: ChannelAccessor<Datum>;
        /** optional radius channel, mainly for dodge/sort convenience in label swarms */
        r?: ChannelAccessor<Datum>;
        /** a Snippet to render as the text content */
        children?: Snippet;
        /** the text content accessor */
        text: ConstantAccessor<string | null | false | undefined, Datum>;
        /** the title attribute for the text element (shown as a browser tooltip) */
        title?: ConstantAccessor<string, Datum>;
        /**
         * the font family of the text
         */
        fontFamily?: ConstantAccessor<CSS.Property.FontFamily, Datum>;
        /** the font size of the text; can be a CSS string or number in pixels */
        fontSize?: ConstantAccessor<CSS.Property.FontSize | number, Datum>;
        /** the font weight of the text (e.g. "bold", 700) */
        fontWeight?: ConstantAccessor<CSS.Property.FontWeight, Datum>;
        /** the font style of the text (e.g. "italic", "normal") */
        fontStyle?: ConstantAccessor<CSS.Property.FontStyle, Datum>;
        /** the font variant of the text (e.g. "small-caps") */
        fontVariant?: ConstantAccessor<CSS.Property.FontVariant, Datum>;
        /** the letter spacing of the text */
        letterSpacing?: ConstantAccessor<CSS.Property.LetterSpacing, Datum>;
        /** the word spacing of the text */
        wordSpacing?: ConstantAccessor<CSS.Property.WordSpacing, Datum>;
        /** the text transform (e.g. "uppercase", "lowercase") */
        textTransform?: ConstantAccessor<CSS.Property.TextTransform, Datum>;
        /** the text decoration (e.g. "underline", "line-through") */
        textDecoration?: ConstantAccessor<CSS.Property.TextDecoration, Datum>;
        /**
         * the horizontal text anchor; start, end, or middle
         */
        textAnchor?: ConstantAccessor<CSS.Property.TextAnchor, Datum>;
        /**
         * the line anchor for vertical position; top, bottom, or middle
         */
        lineAnchor?: ConstantAccessor<'bottom' | 'top' | 'middle'>;
        /**
         * line height as multiplier of font size
         * @default 1.2
         */
        lineHeight?: ConstantAccessor<number, Datum>;
        /** the anchor position within the plot frame when x or y are not specified (e.g. "top-left", "middle") */
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

    type CanvasTextMarkProps = TextCommonMarkProps & {
        /**
         * renders texts as canvas instead of SVG
         */
        canvas: true;
        textClass?: never;
    };

    type SvgTextMarkProps = TextCommonMarkProps & {
        /**
         * renders texts as canvas instead of SVG
         */
        canvas?: false | undefined;
        /**
         * if you want to apply class names to individual text elements. Only supported in SVG rendering.
         */
        textClass?: ConstantAccessor<string, Datum>;
    };

    type TextMarkProps = SvgTextMarkProps | CanvasTextMarkProps;

    import { type Snippet } from 'svelte';
    import GroupMultiple from './helpers/GroupMultiple.svelte';
    import type {
        DataRecord,
        BaseMarkProps,
        ConstantAccessor,
        ChannelAccessor,
        LinkableMarkProps
    } from '../types/index.js';
    import { resolveProp } from '../helpers/resolve.js';
    import Mark from '../Mark.svelte';
    import { sort } from '../index.js';

    import MultilineText from './helpers/MultilineText.svelte';
    import TextCanvas from './helpers/TextCanvas.svelte';
    import { indexData } from 'svelteplot/transforms/recordize';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';

    const DEFAULTS = {
        fontSize: 12,
        c: 500,
        strokeWidth: 1.6,
        frameAnchor: 'middle' as const,
        lineHeight: 1.1,
        rotate: 0,
        ...getPlotDefaults().text
    };

    let markProps: TextMarkProps = $props();

    const mergedProps = $derived({
        ...DEFAULTS,
        ...markProps
    }) as TextMarkProps;

    const {
        data = [{} as Datum],
        canvas = false,
        class: className = '',
        ...options
    } = $derived(mergedProps);

    const args = $derived(
        sort({
            data: indexData(data as object[]) as any,
            ...options
        })
    ) as TextMarkProps;
</script>

<Mark
    {...args as any}
    type={'text' as const}
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
    required={[]}>
    {#snippet children({ mark, scaledData, usedScales }: any)}
        {#if canvas}
            <g class="text {className || ''}">
                <TextCanvas data={scaledData as any} options={args as any} {usedScales} />
            </g>
        {:else}
            <GroupMultiple
                class="text {className}"
                length={className ? 2 : (args.data?.length ?? 0)}>
                {#each scaledData as d, i (i)}
                    {#if d.valid}
                        {@const textLines = String(resolveProp(args.text, d.datum, '')).split('\n')}

                        <MultilineText {textLines} {d} args={args as any} {usedScales} />
                    {/if}
                {/each}
            </GroupMultiple>
        {/if}
    {/snippet}
</Mark>
