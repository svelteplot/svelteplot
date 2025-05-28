<!--
    @component
    line representing a moving average and an area representing volatility as a band
-->
<script module lang="ts">
    export type BollingerYMarkProps = BaseMarkProps & {
        data: DataRow[];
        x?: ChannelAccessor;
        y?: ChannelAccessor;
        /**
         * the window size (the window transform’s k option), an integer; defaults to 20
         */
        n?: number;
        /**
         * the band radius, a number representing a multiple of standard deviations; defaults to 2
         */
        k?: number;
    };
</script>

<script lang="ts">
    import { Area, Line, bollingerY, recordizeY } from '$lib/index.js';
    import type { BaseMarkProps, ChannelAccessor, DataRow } from '$lib/types.js';
    import { pick } from 'es-toolkit';

    let { data, n = 20, k = 2, class: className, ...options }: BollingerYMarkProps = $props();

    const args = $derived(bollingerY(recordizeY({ data, ...options }), { n, k }));
</script>

<g class="bollinger {className || ''}">
    <Line {...pick(args, ['x', 'y', 'data', 'stroke', 'strokeOpacity', 'opacity'])} />
    <Area
        {...{
            x1: '__x',
            y1: '__lo',
            y2: '__hi',
            fillOpacity: 0.2,
            ...pick(args, ['data', 'fill', 'fillOpacity', 'opacity'])
        }} />
</g>
