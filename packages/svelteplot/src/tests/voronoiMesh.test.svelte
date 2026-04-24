<script lang="ts">
    import { VoronoiMesh, Plot } from 'svelteplot';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs?: ComponentProps<typeof Plot>;
        meshArgs: ComponentProps<typeof VoronoiMesh>;
    }

    let { plotArgs, meshArgs }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <VoronoiMesh {...meshArgs} />
</Plot>
