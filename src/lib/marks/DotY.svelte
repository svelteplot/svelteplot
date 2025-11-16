<!-- @component
    Creates a horizontal dot plot with x values along a single y position
-->
<script lang="ts" generics="Datum extends DataRow">
    interface DotYMarkProps extends Omit<ComponentProps<typeof Dot>, 'x' | 'data'> {
        data: Datum[];
    }
    import Dot from './Dot.svelte';
    import { recordizeY } from '$lib/index.js';
    import type { DataRow } from '../types/index.js';
    import type { ComponentProps } from 'svelte';

    let { data = [{} as Datum], ...options }: DotYMarkProps = $props();

    const args = $derived(recordizeY({ data, ...options, x: 0 }, { withIndex: false }));
</script>

<Dot {...args} />
