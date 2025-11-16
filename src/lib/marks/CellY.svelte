<!--
    @component
    For arbitrary rectangles with fixed x position, requires band y scale
-->
<script lang="ts">
    import Cell from './Cell.svelte';
    import { recordizeX } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';
    import type { TransformArgsRow } from 'svelteplot/types/index.js';

    interface CellYMarkProps extends Omit<ComponentProps<typeof Cell>, 'x'> {}

    let { data = [{}], ...options }: CellYMarkProps = $props();

    const args = $derived(
        recordizeX({
            data,
            ...options
        } as TransformArgsRow)
    );
</script>

<Cell {...args} x="0" fill={options.fill || '__value'} />
