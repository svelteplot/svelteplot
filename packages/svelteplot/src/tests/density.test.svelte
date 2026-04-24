<script lang="ts">
    import { Density, Plot } from 'svelteplot';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs: ComponentProps<typeof Plot>;
        densityArgs: ComponentProps<typeof Density>;
    }

    let { plotArgs, densityArgs }: Props = $props();
</script>

<Plot width={200} height={200} axes={false} {...plotArgs}>
    <Density {...densityArgs} />
</Plot>
