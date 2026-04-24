<script lang="ts">
    import { BarY, Plot } from 'svelteplot';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs: ComponentProps<typeof Plot>;
        barArgs: ComponentProps<typeof BarY>;
    }

    let { plotArgs, barArgs }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <BarY {...barArgs} />
</Plot>
