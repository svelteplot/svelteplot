<!-- @component
    Creates a horizontal line chart with x values and index positions for y
-->
<script lang="ts" generics="Datum extends DataRow">
    interface LineYMarkProps extends Omit<ComponentProps<typeof Line>, 'x' | 'data'> {
        data: Datum[];
    }
    import Line from './Line.svelte';
    import { recordizeY } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';
    import type { DataRow } from '$lib/index.js';

    let { data = [{} as Datum], ...rest }: LineYMarkProps = $props();

    let args = $derived(recordizeY({ data, ...rest }));
</script>

<Line {...args} />
