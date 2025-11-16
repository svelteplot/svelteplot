<script lang="ts">
    import { TickY, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs: ComponentProps<typeof Plot>;
        tickArgs: ComponentProps<typeof TickY>;
    }

    let { plotArgs, tickArgs }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <TickY {...tickArgs} />
</Plot>
