<!--
    @component
    For arbitrary rectangles with fixed x position, requires band y scale
-->
<script lang="ts" generics="Datum extends DataRow">
    import Cell from './Cell.svelte';
    import { recordizeX } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';
    import type { DataRow, TransformArgsRow } from 'svelteplot/types/index.js';

    interface CellYMarkProps extends Omit<ComponentProps<typeof Cell>, 'x' | 'data'> {
        data: Datum[];
    }

    let { data = [{}], ...options }: CellYMarkProps = $props();

    const args = $derived(
        recordizeX({
            data,
            ...options
        } as TransformArgsRow<Datum>)
    );
</script>

<Cell {...args} x="0" fill={options.fill || '__value'} />
