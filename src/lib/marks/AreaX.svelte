<!-- @component
    Creates a horizontal area chart with x value and baseline.  Areas are implicitly 
    stacked horizontally if just the x channel is defined.
-->
<script lang="ts" generics="Datum extends DataRow">
    interface AreaXMarkProps extends Omit<ComponentProps<typeof Area>, 'y1' | 'y2'> {
        x?: ChannelAccessor<Datum>;
        y?: ChannelAccessor<Datum>;
    }
    import Area from './Area.svelte';
    import { renameChannels } from '$lib/transforms/rename.js';
    import { stackX } from '$lib/transforms/stack.js';
    import { recordizeX } from '$lib/transforms/recordize.js';
    import type { ChannelAccessor, DataRow, PlotDefaults } from '../types/index.js';
    import { getContext, type ComponentProps } from 'svelte';

    let markProps: AreaXMarkProps = $props();

    const DEFAULTS = getContext<PlotDefaults>('svelteplot/_defaults').areaX;

    const { data, stack, ...options }: AreaXMarkProps = $derived({
        ...(markProps.x == undefined ? { x1: 0, x2: 0 } : {}),
        ...DEFAULTS,
        ...markProps
    });

    const args = $derived(
        renameChannels<AreaXMarkProps>(
            stackX(recordizeX({ data, ...options, y1: null, y2: null }), stack),
            { y: 'y1' }
        )
    );
</script>

<Area {...args}></Area>
