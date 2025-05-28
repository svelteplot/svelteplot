<!-- @component
    Creates a horizontal area chart with x value and baseline.  Areas are implicitly 
    stacked horizontally if just the x channel is defined.
-->
<script lang="ts">
    import Area, { type AreaMarkProps } from './Area.svelte';
    import { renameChannels } from '$lib/transforms/rename.js';
    import { stackX } from '$lib/transforms/stack.js';
    import { recordizeX } from '$lib/transforms/recordize.js';
    import type { ChannelAccessor } from '../types.js';

    type AreaXProps = Omit<AreaMarkProps, 'y1' | 'y2'> & {
        x?: ChannelAccessor;
        y?: ChannelAccessor;
    };

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
