<script lang="ts">
    import { LineX, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs: ComponentProps<typeof Plot>;
        lineArgs: ComponentProps<typeof LineX>;
    }

    let { plotArgs, lineArgs }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <LineX {...lineArgs} />
</Plot>
