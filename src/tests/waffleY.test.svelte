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
    <WaffleY {...waffleArgs} />
</Plot>

