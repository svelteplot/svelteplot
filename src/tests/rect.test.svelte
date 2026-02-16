<script lang="ts">
    import { Rect, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs: ComponentProps<typeof Plot>;
        rectArgs: ComponentProps<typeof Rect>;
    }

    let { plotArgs, rectArgs }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <Rect {...rectArgs} />
</Plot>
