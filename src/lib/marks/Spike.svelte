<!-- 
    @component
    Wrapper around the vector mark with presets suitable for spike maps 
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface SpikeMarkProps extends Omit<
        ComponentProps<typeof Vector>,
        'data' | 'x' | 'y' | 'r' | 'length' | 'rotate'
    > {
        data: Datum[];
        x: ChannelAccessor<Datum>;
        y: ChannelAccessor<Datum>;
        r?: number;
        length?: ChannelAccessor<Datum>;
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
