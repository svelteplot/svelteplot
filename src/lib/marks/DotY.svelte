<!-- @component
    Creates a vertical dot plot with y values along a single x position
-->
<script module lang="ts">
    export type DotYMarkProps = Omit<DotMarkProps, 'y'>;
</script>

<script lang="ts">
    import Dot, { type DotMarkProps } from './Dot.svelte';
    import { recordizeY } from '$lib/index.js';

    let { data = [{}], ...options }: DotYMarkProps = $props();

    const args = $derived(recordizeY({ data, ...options, x: 0 }, { withIndex: false }));
</script>

<Dot {...args} />
