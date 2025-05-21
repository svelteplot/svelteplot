<script lang="ts">
    import Area, { type AreaMarkProps } from './Area.svelte';
    import { renameChannels } from '$lib/transforms/rename.js';
    import { stackX } from '$lib/transforms/stack.js';
    import { recordizeX } from '$lib/transforms/recordize.js';
    import type { DataRow, BaseMarkProps, ChannelAccessor } from '../types.js';

    type AreaXProps = BaseMarkProps & {
        data: DataRow[];
        x?: ChannelAccessor;
        x1?: ChannelAccessor;
        x2?: ChannelAccessor;
        y?: ChannelAccessor;
    } & AreaMarkProps;

    // we're discarding y1 and y2 props since they are not
    let { data, stack, ...options }: AreaXProps = $props();

    const args = $derived(
        renameChannels<AreaXProps>(
            stackX(recordizeX({ data, ...options, y1: null, y2: null }), stack),
            { y: 'y1' }
        )
    );
</script>

<Area {...args}></Area>
