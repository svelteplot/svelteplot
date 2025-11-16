<script lang="ts">
    import { Brush, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';
    import type { Brush as BrushT } from 'svelteplot/marks/Brush.svelte';

    let {
        plotArgs,
        brushArgs,
        brush = $bindable()
    }: {
        plotArgs: ComponentProps<typeof Plot>;
        brushArgs: Omit<ComponentProps<typeof Brush>, 'brush'>;
        brush: BrushT;
    } = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <Brush {...brushArgs} bind:brush />
</Plot>
