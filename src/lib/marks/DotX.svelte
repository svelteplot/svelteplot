<!-- @component
    Creates a horizontal dot plot with x values along a single y position
-->
<script lang="ts" generics="Datum extends DataRow">
    interface DotXMarkProps extends Omit<ComponentProps<typeof Dot>, 'y' | 'data'> {
        data: Datum[];
    }
    import Dot from './Dot.svelte';
    import { recordizeX } from '$lib/index.js';
    import type { DataRow } from '../types/index.js';
    import type { ComponentProps } from 'svelte';

    let { data = [{} as Datum], ...options }: DotXMarkProps = $props();

    const args = $derived(recordizeX({ data, ...options, y: 1 }, { withIndex: false }));
</script>

<Dot {...args} />
