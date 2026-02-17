<script lang="ts">
    import { Plot, Pointer } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs?: ComponentProps<typeof Plot>;
        pointerArgs: Omit<ComponentProps<typeof Pointer>, 'children'>;
    }

    let { plotArgs = {}, pointerArgs }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} margin={0} {...plotArgs}>
    <Pointer {...pointerArgs}>
        {#snippet children({ data })}
            {#each data as d, i (i)}
                <circle class="pointer-selection" r="3" />
            {/each}
        {/snippet}
    </Pointer>
</Plot>
