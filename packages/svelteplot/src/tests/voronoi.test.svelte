<script lang="ts">
    import { Voronoi, Plot } from 'svelteplot';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs?: ComponentProps<typeof Plot>;
        voronoiArgs: ComponentProps<typeof Voronoi>;
    }

    let { plotArgs, voronoiArgs }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <Voronoi {...voronoiArgs} />
</Plot>
