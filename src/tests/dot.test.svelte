<script lang="ts">
    import { Dot, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs: ComponentProps<typeof Plot>;
        dotArgs: ComponentProps<typeof Dot>;
    }

    let { plotArgs, dotArgs }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <Dot {...dotArgs} />
</Plot>
