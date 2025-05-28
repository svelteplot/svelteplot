<script module lang="ts">
    export type CellXMarkProps = Omit<CellMarkProps, 'y'>;
</script>

<script lang="ts">
    import Cell, { type CellMarkProps } from './Cell.svelte';
    import { recordizeY } from '$lib/index.js';

    let { data = [{}], ...options }: CellXMarkProps = $props();

    const args = $derived(
        recordizeY<CellXMarkProps>({
            data,
            ...options
        })
    );
</script>

<Cell {...args} y="0" fill={options.fill || '__value'} />
