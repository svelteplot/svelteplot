<!-- @component
    Creates a vertical area chart with y value and baseline. Areas are implicitly 
    stacked vertically if just the y channel is defined.
-->
<script lang="ts">
    import Area, { type AreaMarkProps } from './Area.svelte';
    import { renameChannels } from '$lib/transforms/rename.js';
    import { stackY } from '$lib/transforms/stack.js';
    import { recordizeY } from '$lib/transforms/recordize.js';
    import type { ChannelAccessor } from '../types.js';

    /**
     * AreaY mark foo
     */
    type AreaYProps = Omit<AreaMarkProps, 'x1' | 'x2'> & {
        x?: ChannelAccessor;
        y?: ChannelAccessor;
    };

    let { data, stack, ...options }: AreaYProps = $props();

    const args = $derived(
        renameChannels<AreaYProps>(
            stackY(recordizeY({ data, ...options, x1: null, x2: null }), stack),
            { x: 'x1' }
        )
    );
</script>

<Area {...args}></Area>
