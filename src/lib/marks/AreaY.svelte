<script lang="ts">
    import Area, { type AreaMarkProps } from './Area.svelte';
    import { renameChannels } from '$lib/transforms/rename.js';
    import { stackY } from '$lib/transforms/stack.js';
    import { recordizeY } from '$lib/transforms/recordize.js';
    import type { DataRecord, BaseMarkProps, ChannelAccessor } from '../types.js';
    import { getContext } from 'svelte';

    /**
     * AreaY mark foo
     */
    type AreaYProps = BaseMarkProps & {
        data: DataRecord[];
        x?: ChannelAccessor;
        y1?: ChannelAccessor;
        y2?: ChannelAccessor;
        /**
         * this some extensive help for the y channel
         */
        y?: ChannelAccessor;
    } & AreaMarkProps;

    const theme = getContext('svelteplot/theme');
    const p = $props();
    let { data, stack, ...options }: AreaYProps = { ...(theme?.marks?.areaY || {}), ...p };

    const args = $derived(
        renameChannels<AreaYProps>(
            stackY(recordizeY({ data, ...options, x1: null, x2: null }), stack),
            { x: 'x1' }
        )
    );
</script>

<!--
@component
The AreaY component can be used for foobar

-->

<Area {...args}></Area>
