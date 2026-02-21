<!--
    @component 
    For showing images positioned at x/y coordinates
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface ImageMarkProps extends BaseMarkProps<Datum>, LinkableMarkProps<Datum> {
        /** the input data array; each element becomes one image */
        data: Datum[];
        /** the horizontal position channel */
        x: ChannelAccessor<Datum>;
        /** the vertical position channel */
        y: ChannelAccessor<Datum>;
        /** the clip radius for the image in pixels */
        r?: ChannelAccessor<Datum>;
        /** the width of the image in pixels */
        width?: ConstantAccessor<number, Datum>;
        /** the height of the image in pixels */
        height?: ConstantAccessor<number, Datum>;
        /** the image source URL */
        src?: ConstantAccessor<string, Datum>;
        /** the title attribute for the image element (shown as a browser tooltip) */
        title?: ConstantAccessor<string, Datum>;
        /** the SVG preserveAspectRatio attribute for the image (e.g. "xMidYMid meet") */
        preserveAspectRatio?: string;
        // canvas?: boolean;
        /** CSS class name(s) to apply to individual image elements */
        imageClass?: ConstantAccessor<string, Datum>;
    }

    import type {
        BaseMarkProps,
        ChannelAccessor,
        ConstantAccessor,
        DataRecord,
        LinkableMarkProps,
        TransformArg
    } from '../types';
    import { resolveProp } from 'svelteplot/helpers/resolve';
    import { getPlotDefaults } from 'svelteplot/hooks/plotDefaults';
    import { sort } from 'svelteplot/transforms';
    import Anchor from './helpers/Anchor.svelte';
    import Mark from 'svelteplot/Mark.svelte';

    let markProps: ImageMarkProps = $props();

    const DEFAULTS: Partial<ImageMarkProps> = {
        width: 20,
        preserveAspectRatio: 'xMidYMin slice',
        ...getPlotDefaults().image
    };

    const {
        data = [{} as Datum],
        width,
        height,
        src,
        title,
        imageClass,
        preserveAspectRatio,
        ...options
    }: ImageMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    const args = $derived(sort({ data, ...options } as TransformArg<Datum>));
</script>

<Mark
    required={['x', 'y']}
    channels={['x', 'y', 'r', 'fill', 'opacity', 'stroke', 'fillOpacity', 'strokeOpacity']}
    {...args}
    type="image">
    {#snippet children({ scaledData })}
        {#each scaledData as record, i (i)}
            {#if record.valid}
                {@const w =
                    record.r !== undefined
                        ? record.r * 2
                        : Number(resolveProp(width, record.datum, 20) ?? 20)}
                {@const h =
                    record.r !== undefined
                        ? record.r * 2
                        : Number(resolveProp(height || width, record.datum, 20) ?? 20)}
                <Anchor {options} datum={record.datum}>
                    <image
                        class={resolveProp(imageClass, record.datum, null)}
                        href={resolveProp(src, record.datum, '')}
                        x={record.x! - w * 0.5}
                        y={record.y! - h * 0.5}
                        {preserveAspectRatio}
                        clip-path={record.r !== undefined ? `circle(${record.r}px)` : null}
                        width={w}
                        height={h}
                        >{#if title}<title>{resolveProp(title, record.datum, '')}</title
                            >{/if}</image>
                </Anchor>
            {/if}
        {/each}
    {/snippet}
</Mark>
