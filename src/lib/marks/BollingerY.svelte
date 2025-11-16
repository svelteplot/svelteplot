<!--
    @component
    line representing a moving average and an area representing volatility as a band
-->
<script lang="ts" generics="Datum extends DataRecord">
    import { Area, Line, bollingerY, recordizeY } from '$lib/index.js';
    import type {
        BaseMarkProps,
        ChannelAccessor,
        DataRecord,
        TransformArg
    } from 'svelteplot/types/index.js';
    import { pick } from 'es-toolkit';

    interface BollingerYMarkProps extends BaseMarkProps<Datum> {
        data: Datum[];
        x?: ChannelAccessor<Datum>;
        y?: ChannelAccessor<Datum>;
        /**
         * the window size (the window transform's k option), an integer; defaults to 20
         */
        n?: number;
        /**
         * the band radius, a number representing a multiple of standard deviations; defaults to 2
         */
        k?: number;
    }

    let { data, n = 20, k = 2, class: className, ...options }: BollingerYMarkProps = $props();

    const args = $derived(
        bollingerY(recordizeY({ data, ...options } as TransformArg<DataRecord>), { n, k })
    );
</script>

<g class="bollinger {className || ''}">
    <Line {...pick(args, ['x', 'y', 'data', 'stroke', 'strokeOpacity', 'opacity'])} />
    <Area
        {...{
            x1: '__x',
            y1: '__lo',
            y2: '__hi',
            ...pick(args, ['data', 'fill', 'fillOpacity', 'opacity']),
            fillOpacity: 0.2
        }} />
</g>
