<script lang="ts">
    import { Hull, Plot } from 'svelteplot';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs?: ComponentProps<typeof Plot>;
        hullArgs: ComponentProps<typeof Hull>;
    }

    let { plotArgs, hullArgs }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <Hull {...hullArgs} />
</Plot>
