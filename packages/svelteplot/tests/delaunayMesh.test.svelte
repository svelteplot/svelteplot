<script lang="ts">
    import { DelaunayMesh, Plot } from 'svelteplot';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs?: ComponentProps<typeof Plot>;
        meshArgs: ComponentProps<typeof DelaunayMesh>;
    }

    let { plotArgs, meshArgs }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <DelaunayMesh {...meshArgs} />
</Plot>
