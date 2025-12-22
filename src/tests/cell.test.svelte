<script lang="ts">
    import { Cell, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs: ComponentProps<typeof Plot>;
        cellArgs: ComponentProps<typeof Cell>;
    }

    let { plotArgs, cellArgs }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <Cell {...cellArgs} />
</Plot>
