<script lang="ts">
    import { TickX, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs: ComponentProps<typeof Plot>;
        tickArgs: ComponentProps<typeof TickX>;
    }

    let { plotArgs, tickArgs }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <TickX {...tickArgs} />
</Plot>
