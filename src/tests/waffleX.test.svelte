<script lang="ts">
    import { WaffleX, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs: ComponentProps<typeof Plot>;
        waffleArgs: ComponentProps<typeof WaffleX>;
    }

    let { plotArgs, waffleArgs }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <WaffleX {...waffleArgs} />
</Plot>

