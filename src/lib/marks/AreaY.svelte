<!-- @component
    Creates a vertical area chart with y value and baseline. Areas are implicitly 
    stacked vertically if just the y channel is defined.
-->
<script lang="ts" generics="Datum extends DataRow">
    interface AreaYMarkProps extends Omit<ComponentProps<typeof Area>, 'x1' | 'x2'> {
        x?: ChannelAccessor<Datum>;
        y?: ChannelAccessor<Datum>;
    }
    import Area from './Area.svelte';
    import { renameChannels } from '$lib/transforms/rename.js';
    import { stackY } from '$lib/transforms/stack.js';
    import { recordizeY } from '$lib/transforms/recordize.js';
    import type { ChannelAccessor, DataRow } from '../types/index.js';
    import { getPlotDefaults } from '$lib/hooks/plotDefaults.js';

    let markProps: AreaYMarkProps = $props();

    const DEFAULTS = getPlotDefaults().areaY;

    const { data, stack, ...options }: AreaYMarkProps = $derived({
        ...(markProps.y == undefined ? { y1: 0, y2: 0 } : {}),
        ...DEFAULTS,
        ...markProps
    });

    const args = $derived(
        renameChannels<AreaYMarkProps>(
            stackY(recordizeY({ data, ...options, x1: null, x2: null }), stack),
            { x: 'x1' }
        )
    );
</script>

<Area {...args}></Area>
