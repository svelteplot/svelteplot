<!-- 
    @component
    Wrapper around the vector mark with presets suitable for spike maps 
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface SpikeMarkProps extends Omit<
        ComponentProps<typeof Vector>,
        'data' | 'x' | 'y' | 'r' | 'length' | 'rotate'
    > {
        /** the input data array; each element becomes one spike */
        data?: Datum[];
        /** the horizontal position channel; bound to the x scale */
        x?: ChannelAccessor<Datum>;
        /** the vertical position channel; bound to the y scale */
        y?: ChannelAccessor<Datum>;
        /** the radius (width) of the spike base in pixels */
        r?: number;
        /** the length of the spike in pixels */
        length?: ChannelAccessor<Datum>;
        /** rotation angle of the spike in degrees */
        rotate?: ChannelAccessor<Datum>;
    }
    import Vector from './Vector.svelte';
    import type { ChannelAccessor, DataRecord } from '../types/index.js';
    import { type ComponentProps } from 'svelte';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';

    let markProps: SpikeMarkProps = $props();

    const DEFAULTS = {
        fill: 'currentColor',
        fillOpacity: 0.3,
        strokeWidth: 1,
        anchor: 'start' as const,
        stroke: 'currentColor',
        sort: { channel: '-y' },
        shape: 'spike' as const,
        ...getPlotDefaults().spike
    };

    const { data = [{} as Datum], ...options }: SpikeMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });
</script>

<Vector {data} {...options} />
