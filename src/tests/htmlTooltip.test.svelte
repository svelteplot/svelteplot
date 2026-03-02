<script lang="ts">
    import { Plot, Dot } from '$lib/index.js';
    import HTMLTooltip from '$lib/marks/HTMLTooltip.svelte';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs?: ComponentProps<typeof Plot>;
        tooltipArgs: Omit<ComponentProps<typeof HTMLTooltip>, 'children'>;
    }

    let { plotArgs = {}, tooltipArgs }: Props = $props();
</script>

<Plot width={200} height={100} axes={false} margin={0} {...plotArgs}>
    <Dot
        data={tooltipArgs.data}
        x={tooltipArgs.x}
        y={tooltipArgs.y}
        fx={tooltipArgs.fx}
        fy={tooltipArgs.fy}
        r={1} />
    {#snippet overlay()}
        <HTMLTooltip {...tooltipArgs}>
            {#snippet children({ datum })}
                <span class="tooltip-content" data-datum={JSON.stringify(datum)}
                    >{datum ? 'visible' : 'hidden'}</span>
            {/snippet}
        </HTMLTooltip>
    {/snippet}
</Plot>
