<script lang="ts">
    import { DelaunayLink, Plot } from 'svelteplot';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs?: ComponentProps<typeof Plot>;
        linkArgs: ComponentProps<typeof DelaunayLink>;
    }

    let { plotArgs, linkArgs }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <DelaunayLink {...linkArgs} />
</Plot>
