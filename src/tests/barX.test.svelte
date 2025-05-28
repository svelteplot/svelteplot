<script lang="ts">
    import { BarX, Plot } from 'svelteplot';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs: ComponentProps<typeof Plot>;
        barArgs: ComponentProps<typeof BarX>;
    }

    let { plotArgs, barArgs }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <BarX {...barArgs} />
</Plot>
