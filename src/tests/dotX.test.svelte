<script lang="ts">
    import { DotX, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs: ComponentProps<typeof Plot>;
        dotArgs: ComponentProps<typeof DotX>;
    }

    let { plotArgs, dotArgs }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <DotX {...dotArgs} />
</Plot>
