<script module lang="ts">
    export type CellYMarkProps = Omit<CellMarkProps, 'x'>;
</script>

<script lang="ts">
    import Cell, { type CellMarkProps } from './Cell.svelte';
    import { recordizeX } from '$lib/index.js';

    let { data = [{}], ...options }: CellYMarkProps = $props();

    const args = $derived(
        recordizeX<CellYMarkProps>({
            data,
            ...options
        })
    );
</script>

<Cell {...args} x="0" fill={options.fill || '__value'} />
