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
        canvas?: boolean;
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
         * the horizontal text anchor; start, end, or middle
         */
        textAnchor?: ConstantAccessor<CSS.Property.TextAnchor, Datum>;
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
    import { sort } from '$lib/index.js';

    import MultilineText from './helpers/MultilineText.svelte';
    import TextCanvas from './helpers/TextCanvas.svelte';
    import { indexData } from 'svelteplot/transforms/recordize';
    import { getPlotDefaults } from '$lib/hooks/plotDefaults.js';

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

    const {
        data = [{} as Datum],
        canvas = false,
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
    required={[]}
    {...args}>
    {#snippet children({ mark, scaledData, usedScales })}
        {#if canvas}
            <g class="text {className || ''}">
                <TextCanvas data={scaledData} options={args} {usedScales} />
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
