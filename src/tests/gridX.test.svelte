<script lang="ts">
    import { GridX, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs: ComponentProps<typeof Plot>;
        gridArgs: ComponentProps<typeof GridX>;
    }

    let { plotArgs, gridArgs }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <GridX {...gridArgs} />
</Plot>
