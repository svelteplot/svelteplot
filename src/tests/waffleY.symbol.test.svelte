<script lang="ts">
    import { WaffleY, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs: ComponentProps<typeof Plot>;
        waffleArgs: ComponentProps<typeof WaffleY>;
    }

    let { plotArgs, waffleArgs }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <WaffleY {...waffleArgs}>
        {#snippet symbol({ x, y, width, height, style, styleClass })}
            <!-- simple custom symbol to test snippet usage -->
            <circle
                {style}
                class={['unit-symbol', styleClass]}
                cx={x + width / 2}
                cy={y + height / 2}
                r={Math.min(width, height) / 3} />
        {/snippet}
    </WaffleY>
</Plot>
