<script lang="ts">
    import { DifferenceY, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs?: ComponentProps<typeof Plot>;
        diffArgs: ComponentProps<typeof DifferenceY>;
    }

    let { plotArgs = {}, diffArgs }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <DifferenceY {...diffArgs} />
</Plot>
