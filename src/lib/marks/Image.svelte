<!--
    @component 
    For showing images positioned at x/y coordinates
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface ImageMarkProps extends BaseMarkProps<Datum>, LinkableMarkProps<Datum> {
        data: Datum[];
        x: ChannelAccessor<Datum>;
        y: ChannelAccessor<Datum>;
        r?: ChannelAccessor<Datum>;
        width?: ConstantAccessor<number, Datum>;
        height?: ConstantAccessor<number, Datum>;
        src?: ConstantAccessor<string, Datum>;
        title?: ConstantAccessor<string, Datum>;
        preserveAspectRatio?: string;
        // canvas?: boolean;
        imageClass?: ConstantAccessor<string, Datum>;
    }

    import type {
        BaseMarkProps,
        ChannelAccessor,
        ConstantAccessor,
        DataRecord,
        LinkableMarkProps
    } from '../types';
    import { resolveProp } from 'svelteplot/helpers/resolve';
    import CustomMark from './CustomMark.svelte';
    import { getPlotDefaults } from 'svelteplot/hooks/plotDefaults';
    import { sort } from 'svelteplot/transforms';
    import Anchor from './helpers/Anchor.svelte';

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

    const args = $derived(sort({ data, ...options }));
</script>

<CustomMark type="image" {...args}>
    {#snippet mark({ record, index, usedScales })}
        {@const w = record.r !== undefined ? record.r * 2 : resolveProp(width, record.datum, 20)}
        {@const h =
            record.r !== undefined ? record.r * 2 : resolveProp(height || width, record.datum, 20)}
        <Anchor {options} datum={record.datum}>
            <image
                class={resolveProp(imageClass, record.datum, null)}
                href={resolveProp(src, record.datum, '')}
                x={record.x - w * 0.5}
                y={record.y - h * 0.5}
                {preserveAspectRatio}
                clip-path={record.r !== undefined ? `circle(${record.r}px)` : null}
                width={w}
                height={h}
                >{#if title}<title>{resolveProp(title, record.datum, '')}</title>{/if}</image>
        </Anchor>
    {/snippet}
</CustomMark>
