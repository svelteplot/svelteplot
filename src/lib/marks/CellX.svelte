<!--
    @component
    For arbitrary rectangles with fixed y position, requires band x scale
-->
<script lang="ts" generics="Datum extends DataRow">
    import Cell from './Cell.svelte';
    import { recordizeY } from '../index.js';
    import type { ComponentProps } from 'svelte';
    import type { DataRow, TransformArgsRow } from 'svelteplot/types/index.js';

    interface CellXMarkProps extends Omit<ComponentProps<typeof Cell>, 'y' | 'data'> {
        data: Datum[];
    }

    let { data = [{}], ...options }: CellXMarkProps = $props();

    const args = $derived(
        recordizeY({
            data,
            ...options
        } as TransformArgsRow<Datum>)
    );
</script>

<Cell {...args} y="0" fill={options.fill || '__value'} />
