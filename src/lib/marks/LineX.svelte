<!-- @component
    Creates a horizontal line chart with x values and index positions for y
-->
<script lang="ts" generics="Datum extends DataRow">
    interface LineXMarkProps extends Omit<ComponentProps<typeof Line>, 'y' | 'data'> {
        /** the input data array */
        data: Datum[];
    }
    import Line from './Line.svelte';
    import { recordizeX } from '../index.js';
    import type { ComponentProps } from 'svelte';
    import type { DataRow } from 'svelteplot/types/index.js';

    let { data = [{} as Datum], ...rest }: LineXMarkProps = $props();

    let args = $derived(recordizeX({ data, ...rest }));
</script>

<Line {...args} />
