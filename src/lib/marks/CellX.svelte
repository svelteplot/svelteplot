<!--
    @component
    For arbitrary rectangles with fixed y position, requires band x scale
-->
<script lang="ts">
    import Cell from './Cell.svelte';
    import { recordizeY } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';
    import type { TransformArgsRow } from 'svelteplot/types/index.js';

    interface CellXMarkProps extends Omit<ComponentProps<typeof Cell>, 'y'> {}

    let { data = [{}], ...options }: CellXMarkProps = $props();

    const args = $derived(
        recordizeY({
            data,
            ...options
        } as TransformArgsRow)
    );
</script>

<Cell {...args} y="0" fill={options.fill || '__value'} />
