<script lang="ts">
    import { Dot, Plot, HTMLTooltip } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs?: ComponentProps<typeof Plot>;
        dotArgs?: ComponentProps<typeof Dot>;
        tooltipArgs: Omit<ComponentProps<typeof HTMLTooltip>, 'children'>;
    }

    let { plotArgs = {}, dotArgs, tooltipArgs }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} margin={0} {...plotArgs}>
    {#if dotArgs}
        <Dot {...dotArgs} />
    {/if}
    {#snippet overlay()}
        <HTMLTooltip {...tooltipArgs}>
            {#snippet children({ datum })}
                {#if datum}
                    <span class="tooltip-content" data-label={datum.label}>{datum.label}</span>
                {/if}
            {/snippet}
        </HTMLTooltip>
    {/snippet}
</Plot>
