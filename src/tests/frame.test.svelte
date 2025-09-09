<script lang="ts">
    import { Frame, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs: ComponentProps<typeof Plot>;
        frameArgs: ComponentProps<typeof Frame>;
    }

    let { plotArgs, frameArgs }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <Frame {...frameArgs} />
</Plot>
